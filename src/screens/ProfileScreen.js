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

// Список доступних жанрів
const GENRES = [
  { label: 'Екшн', value: 'Екшн' },
  { label: 'Комедія', value: 'Комедія' },
  { label: 'Драма', value: 'Драма' },
  { label: 'Жахи', value: 'Жахи' },
  { label: 'Фантастика', value: 'Фантастика' },
  { label: 'Мультфільм', value: 'Мультфільм' },
  { label: 'Трилер', value: 'Трилер' },
];

export default function ProfileScreen() {
  const currentUserId = useMovieStore(state => state.currentUserId);
  const users = useMovieStore(state => state.users);
  const { login, logout, updateProfile } = useMovieStore();
  
  const user = users.find(u => u.id === currentUserId);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { control, handleSubmit, reset } = useForm();

  const handleAuth = async (data) => {
    const res = login(data, isSignUp);
    if (res && res.success) {
      Alert.alert("Успіх", isSignUp ? "Акаунт створено!" : "Ви увійшли!");
      reset(); // Очищуємо форму після входу
    } else {
      Alert.alert("Помилка", res?.message || "Невірні дані");
    }
  };

  const handleUpdate = (data) => {
    updateProfile(data);
    setIsEditing(false);
    Alert.alert("Успіх", "Профіль оновлено");
  };

  // --- ЕКРАН АВТОРИЗОВАНОГО КОРИСТУВАЧА ---
  if (user) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Мій Профіль</Text>
          
          {isEditing ? (
            <View style={{width: '100%'}}>
              <Text style={styles.label}>Ім'я</Text>
              <Controller 
                control={control} 
                name="name" 
                defaultValue={user.name} 
                render={({field:{onChange, value}}) => (
                  <TextInput style={styles.input} value={value} onChangeText={onChange} />
                )} 
              />
              
              <Text style={styles.label}>Улюблений жанр</Text>
              <View style={styles.pickerWrapper}>
                <Controller 
                  control={control} 
                  name="genre" 
                  defaultValue={user.genre} 
                  render={({field:{onChange, value}}) => (
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      style={styles.picker}
                    >
                      {GENRES.map(g => (
                        <Picker.Item key={g.value} label={g.label} value={g.value} />
                      ))}
                    </Picker>
                  )} 
                />
              </View>

              <TouchableOpacity style={styles.mainBtn} onPress={handleSubmit(handleUpdate)}>
                <Text style={styles.btnText}>Зберегти зміни</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.mainBtn, {backgroundColor: '#ccc', marginTop: 10}]} 
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.btnText}>Скасувати</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={styles.welcome}>Привіт, {user.name}!</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Жанр:</Text>
                <Text style={styles.infoValue}>{user.genre}</Text>
              </View>
              
              <TouchableOpacity style={styles.mainBtn} onPress={() => setIsEditing(true)}>
                <Text style={styles.btnText}>Редагувати профіль</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mainBtn, {backgroundColor: '#666', marginTop: 10}]} onPress={logout}>
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
        <>
          <Text style={styles.label}>Логін</Text>
          <Controller 
            control={control} 
            name="username" 
            defaultValue=""
            render={({field:{onChange, value}}) => (
              <TextInput style={styles.input} placeholder="Ваше ім'я" onChangeText={onChange} value={value} />
            )} 
          />
          <Text style={styles.label}>Ваш улюблений жанр</Text>
          <View style={styles.pickerWrapper}>
            <Controller 
              control={control} 
              name="genre" 
              defaultValue="Фантастика"
              render={({field:{onChange, value}}) => (
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  {GENRES.map(g => (
                    <Picker.Item key={g.value} label={g.label} value={g.value} />
                  ))}
                </Picker>
              )} 
            />
          </View>
        </>
      )}

      <Text style={styles.label}>Email</Text>
      <Controller 
        control={control} 
        name="email" 
        defaultValue=""
        render={({field:{onChange, value}}) => (
          <TextInput 
            style={styles.input} 
            placeholder="example@mail.com" 
            onChangeText={onChange} 
            value={value} 
            keyboardType="email-address" 
            autoCapitalize="none" 
          />
        )} 
      />

      <Text style={styles.label}>Пароль</Text>
      <Controller 
        control={control} 
        name="password" 
        defaultValue=""
        render={({field:{onChange, value}}) => (
          <TextInput 
            style={styles.input} 
            placeholder="Мінімум 6 символів" 
            onChangeText={onChange} 
            value={value} 
            secureTextEntry 
          />
        )} 
      />

      {isSignUp && (
        <>
          <Text style={styles.label}>Підтвердіть пароль</Text>
          <Controller 
            control={control} 
            name="confirmPassword" 
            defaultValue=""
            render={({field:{onChange, value}}) => (
              <TextInput style={styles.input} placeholder="Повторіть пароль" onChangeText={onChange} value={value} secureTextEntry />
            )} 
          />
        </>
      )}

      <TouchableOpacity style={styles.mainBtn} onPress={handleSubmit(handleAuth)}>
        <Text style={styles.btnText}>{isSignUp ? "Зареєструватися" : "Увійти"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); reset(); }} style={{marginTop: 20}}>
        <Text style={{textAlign: 'center', color: '#e91e63', fontWeight: '500'}}>
          {isSignUp ? "Вже є акаунт? Увійдіть" : "Немає акаунту? Реєстрація"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 25, justifyContent: 'center', backgroundColor: '#fff' },
  card: { padding: 20, backgroundColor: '#f9f9f9', borderRadius: 15, alignItems: 'center', elevation: 3 },
  profileInfo: { width: '100%', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#e91e63', marginBottom: 20, textAlign: 'center' },
  welcome: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  infoRow: { flexDirection: 'row', marginBottom: 10, width: '100%', justifyContent: 'center' },
  infoLabel: { fontWeight: 'bold', color: '#666', marginRight: 5 },
  infoValue: { color: '#333' },
  label: { alignSelf: 'flex-start', fontWeight: 'bold', marginBottom: 5, color: '#444', fontSize: 14 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 15, backgroundColor: '#fff' },
  pickerWrapper: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  picker: { width: '100%', height: 50 },
  mainBtn: { width: '100%', backgroundColor: '#e91e63', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});