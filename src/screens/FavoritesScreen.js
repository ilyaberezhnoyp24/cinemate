import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMovieStore } from '../store/useMovieStore';

export default function FavoritesScreen({ navigation }) {
  const users = useMovieStore((state) => state.users);
  const currentUserId = useMovieStore((state) => state.currentUserId);
  const user = users.find(u => u.id === currentUserId);
  
  const theme = user?.theme || { background: '#ffffff', accent: '#e91e63', isDark: false };
  const favorites = user ? user.favorites : [];

  const renderItem = ({ item }) => {
    // Округляємо рейтинг, якщо він існує
    const displayRating = item.rating?.average 
      ? item.rating.average.toFixed(1) 
      : '-';

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: theme.isDark ? '#1e1e1e' : '#fff' }]} 
        onPress={() => navigation.navigate('Details', { movie: item })}
      >
        <Image 
          source={{ uri: item.image?.medium || 'https://via.placeholder.com/100x150' }} 
          style={styles.poster} 
        />
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.isDark ? '#fff' : '#000' }]}>
            {item.name}
          </Text>
          <Text style={[styles.rating, { color: theme.accent }]}>
            ⭐ {displayRating}/10
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!currentUserId) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.isDark ? '#aaa' : 'gray' }}>
          Увійдіть у профіль для перегляду обраного
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.isDark ? '#666' : 'gray' }]}>
            Список порожній
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { flexDirection: 'row', marginBottom: 10, borderRadius: 8, overflow: 'hidden', elevation: 2 },
  poster: { width: 80, height: 120 },
  info: { padding: 10, justifyContent: 'center', flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold' },
  rating: { marginTop: 5, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});