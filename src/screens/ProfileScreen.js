import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useMovieStore } from '../store/useMovieStore';

const GENRES = [
  { label: 'Екшн', value: 'Екшн' },
  { label: 'Комедія', value: 'Комедія' },
  { label: 'Драма', value: 'Драма' },
  { label: 'Жахи', value: 'Жахи' },
  { label: 'Фантастика', value: 'Фантастика' },
  { label: 'Мультфільм', value: 'Мультфільм' },
  { label: 'Трилер', value: 'Трилер' },
];

const ACCENT_COLORS = [
  { id: 'red', value: '#f44336' },
  { id: 'purple', value: '#9c27b0' },
  { id: 'pink', value: '#e91e63' },
  { id: 'blue', value: '#2196f3' },
  { id: 'green', value: '#4caf50' },
  { id: 'yellow', value: '#ffeb3b' },
];

const BG_COLORS = [
  { id: 'light', value: '#ffffff', isDark: false },
  { id: 'dark', value: '#121212', isDark: true },
];

export default function ProfileScreen() {
  const currentUserId = useMovieStore(state => state.currentUserId);
  const users = useMovieStore(state => state.users);
  const { login, logout, updateProfile } = useMovieStore();
  
  const user = users.find(u => u.id === currentUserId);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0].value);

  // Отримуємо поточну тему або дефолтну
  const theme = user?.theme || { background: '#ffffff', accent: '#e91e63', isDark: false };

  const { control, handleSubmit, reset, watch, setError, formState: { errors } } = useForm({
    mode: "onChange" 
  });

  const password = watch("password");

  const handleAuth = async (data) => {
    // При реєстрації додаємо дефолтну тему
    const authData = isSignUp ? { 
      ...data, 
      genres: [], 
      theme: { background: '#ffffff', accent: '#e91e63', isDark: false } 
    } : data;

    const res = login(authData, isSignUp);
    if (res && res.success) {
      Alert.alert("Успіх", isSignUp ? "Акаунт створено!" : "Ви увійшли!");
      reset();
    } else {
      if (!isSignUp) {
        setError("email", { type: "manual", message: " " });
        setError("password", { type: "manual", message: res?.message || "Невірні дані" });
      } else {
        setError("email", { type: "manual", message: res?.message || "Помилка" });
      }
    }
  };

  const handleUpdate = (data) => {
    updateProfile(data);
    setIsEditing(false);
    Alert.alert("Успіх", "Профіль оновлено");
  };

  const addGenre = (currentGenres, onChange) => {
    const list = currentGenres || [];
    if (!list.includes(selectedGenre)) {
      onChange([...list, selectedGenre]);
    } else {
      Alert.alert("Інфо", "Жанр вже додано");
    }
  };

  const removeGenre = (currentGenres, genreToRemove, onChange) => {
    onChange(currentGenres.filter(g => g !== genreToRemove));
  };

  // --- ЕКРАН ПРОФІЛЮ ---
  if (user) {
    return (
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.card, { backgroundColor: theme.isDark ? '#1e1e1e' : '#f9f9f9' }]}>
          <Text style={[styles.title, { color: theme.accent }]}>Мій Профіль</Text>
          
          {isEditing ? (
            <View style={{width: '100%'}}>
              <Text style={[styles.label, { color: theme.isDark ? '#bbb' : '#444' }]}>Ім'я</Text>
              <Controller 
                control={control} 
                name="name" 
                defaultValue={user.name} 
                rules={{ required: "Обов'язково" }}
                render={({field:{onChange, value}}) => (
                  <View style={styles.inputContainer}>
                    <TextInput 
                      style={[styles.input, { backgroundColor: theme.isDark ? '#2c2c2c' : '#fff', color: theme.isDark ? '#fff' : '#000' }]} 
                      value={value} 
                      onChangeText={onChange} 
                    />
                  </View>
                )} 
              />
              
              <Text style={[styles.label, { color: theme.isDark ? '#bbb' : '#444' }]}>Улюблені жанри</Text>
              <Controller 
                control={control} 
                name="genres" 
                defaultValue={user.genres || []} 
                render={({field:{onChange, value}}) => (
                  <View style={{width: '100%'}}>
                    <View style={styles.genresBadgeContainer}>
                      {value.map((g) => (
                        <View key={g} style={[styles.badge, { backgroundColor: theme.accent }]}>
                          <Text style={styles.badgeText}>{g}</Text>
                          <TouchableOpacity onPress={() => removeGenre(value, g, onChange)}>
                            <Text style={styles.removeIcon}> ✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                    <View style={styles.addGenreRow}>
                      <View style={[styles.pickerWrapper, { flex: 1, backgroundColor: theme.isDark ? '#2c2c2c' : '#fff' }]}>
                        <Picker
                          selectedValue={selectedGenre}
                          onValueChange={(v) => setSelectedGenre(v)}
                          style={{ color: theme.isDark ? '#fff' : '#000' }}
                        >
                          {GENRES.map(g => <Picker.Item key={g.value} label={g.label} value={g.value} />)}
                        </Picker>
                      </View>
                      <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.accent }]} onPress={() => addGenre(value, onChange)}>
                        <Text style={styles.addBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )} 
              />

              <Text style={[styles.label, { color: theme.isDark ? '#bbb' : '#444' }]}>Колір фону</Text>
              <View style={styles.colorRow}>
                {BG_COLORS.map(bg => (
                  <TouchableOpacity 
                    key={bg.id} 
                    onPress={() => updateProfile({ theme: { ...theme, background: bg.value, isDark: bg.isDark } })}
                    style={[styles.colorCircle, { backgroundColor: bg.value, borderWidth: theme.background === bg.value ? 3 : 1, borderColor: theme.accent }]} 
                  />
                ))}
              </View>

              <Text style={[styles.label, { color: theme.isDark ? '#bbb' : '#444' }]}>Колір акценту</Text>
              <View style={styles.colorRow}>
                {ACCENT_COLORS.map(c => (
                  <TouchableOpacity 
                    key={c.id} 
                    onPress={() => updateProfile({ theme: { ...theme, accent: c.value } })}
                    style={[styles.colorCircle, { backgroundColor: c.value, borderWidth: theme.accent === c.value ? 3 : 0, borderColor: theme.isDark ? '#fff' : '#000' }]} 
                  />
                ))}
              </View>

              <TouchableOpacity style={[styles.mainBtn, { backgroundColor: theme.accent }]} onPress={handleSubmit(handleUpdate)}>
                <Text style={styles.btnText}>Зберегти зміни</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mainBtn, {backgroundColor: '#666', marginTop: 10}]} onPress={() => setIsEditing(false)}>
                <Text style={styles.btnText}>Скасувати</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={[styles.welcome, { color: theme.isDark ? '#fff' : '#333' }]}>Привіт, {user.name}!</Text>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.isDark ? '#aaa' : '#666' }]}>Email:</Text>
                <Text style={[styles.infoValue, { color: theme.isDark ? '#fff' : '#333' }]}>{user.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.isDark ? '#aaa' : '#666' }]}>Жанри:</Text>
                <Text style={[styles.infoValue, { color: theme.isDark ? '#fff' : '#333' }]}>
                   {user.genres?.length > 0 ? user.genres.join(', ') : 'Не обрано'}
                </Text>
              </View>
              
              <TouchableOpacity style={[styles.mainBtn, { backgroundColor: theme.accent }]} onPress={() => setIsEditing(true)}>
                <Text style={styles.btnText}>Налаштування</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mainBtn, {backgroundColor: '#444', marginTop: 10}]} onPress={logout}>
                <Text style={styles.btnText}>Вийти</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // --- ЕКРАН ВХОДУ / РЕЄСТРАЦІЇ ---
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isSignUp ? "Реєстрація" : "Вхід"}</Text>
      
      {isSignUp && (
        <Controller control={control} name="username" rules={{ required: "Обов'язково" }} render={({field:{onChange, value}}) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Логін</Text>
            <TextInput style={[styles.input, errors.username && styles.inputError]} placeholder="Ваше ім'я" onChangeText={onChange} value={value} />
          </View>
        )} />
      )}

      <Controller control={control} name="email" rules={{ required: "Обов'язково" }} render={({field:{onChange, value}}) => (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={[styles.input, errors.email && styles.inputError]} placeholder="mail@mail.com" onChangeText={onChange} value={value} autoCapitalize="none" />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
        </View>
      )} />

      <Controller control={control} name="password" rules={{ required: "Обов'язково", minLength: 6 }} render={({field:{onChange, value}}) => (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Пароль</Text>
          <TextInput style={[styles.input, errors.password && styles.inputError]} placeholder="******" onChangeText={onChange} value={value} secureTextEntry />
          {errors.password && <Text style={styles.errorText}>{errors.password.message || "Мінімум 6 символів"}</Text>}
        </View>
      )} />

      {isSignUp && (
        <Controller control={control} name="confirmPassword" render={({field:{onChange, value}}) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Підтвердіть пароль</Text>
            <TextInput style={[styles.input, errors.confirmPassword && styles.inputError]} placeholder="Повторіть" onChangeText={onChange} value={value} secureTextEntry />
          </View>
        )} />
      )}

      <TouchableOpacity style={styles.mainBtn} onPress={handleSubmit(handleAuth)}>
        <Text style={styles.btnText}>{isSignUp ? "Створити акаунт" : "Увійти"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); reset(); }} style={{marginTop: 20}}>
        <Text style={{textAlign: 'center', color: '#e91e63'}}>{isSignUp ? "Вже є акаунт? Вхід" : "Немає акаунту? Реєстрація"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 25, justifyContent: 'center', backgroundColor: '#fff' },
  card: { padding: 20, borderRadius: 15, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  label: { alignSelf: 'flex-start', fontWeight: 'bold', marginTop: 10, marginBottom: 5, fontSize: 13 },
  inputContainer: { width: '100%', marginBottom: 10 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10 },
  inputError: { borderColor: '#ff4d4d' },
  errorText: { color: '#ff4d4d', fontSize: 11, marginTop: 2 },
  mainBtn: { width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15, backgroundColor: '#e91e63' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  welcome: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { fontWeight: 'bold', marginRight: 5 },
  infoValue: { flexShrink: 1 },
  genresBadgeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  badge: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8, alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  removeIcon: { color: '#fff', marginLeft: 5, fontWeight: 'bold' },
  addGenreRow: { flexDirection: 'row', marginBottom: 15 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, overflow: 'hidden' },
  addBtn: { width: 50, marginLeft: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 24 },
  colorRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginVertical: 10 },
  colorCircle: { width: 35, height: 35, borderRadius: 18 },
  profileInfo: { width: '100%', alignItems: 'center' }
});