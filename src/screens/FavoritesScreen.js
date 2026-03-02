import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMovieStore } from '../store/useMovieStore';

export default function FavoritesScreen({ navigation }) {
  // Дістаємо дані про користувачів та ID поточного юзера
  const users = useMovieStore((state) => state.users);
  const currentUserId = useMovieStore((state) => state.currentUserId);

  // Знаходимо поточного користувача та його список улюблених
  const currentUser = users.find(u => u.id === currentUserId);
  const favorites = currentUser ? currentUser.favorites : [];

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('Details', { movie: item })}
    >
      <Image 
        source={{ uri: item.show?.image?.medium || item.image?.medium || 'https://via.placeholder.com/100x150' }} 
        style={styles.poster} 
      />
      <View style={styles.info}>
        <Text style={styles.title}>{item.show?.name || item.name}</Text>
        <Text style={styles.rating}>⭐ {item.show?.rating?.average || item.rating?.average || '-'}/10</Text>
      </View>
    </TouchableOpacity>
  );

  // Якщо користувач не увійшов в акаунт
  if (!currentUserId) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Увійдіть у профіль, щоб переглядати свій список улюблених</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>У вас поки немає улюблених фільмів</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f0f0f0' },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginBottom: 10, borderRadius: 8, overflow: 'hidden', elevation: 2 },
  poster: { width: 80, height: 120 },
  info: { padding: 10, justifyContent: 'center', flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold' },
  rating: { marginTop: 5, color: '#e91e63' },
  empty: { textAlign: 'center', marginTop: 50, color: 'gray', fontSize: 16, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});