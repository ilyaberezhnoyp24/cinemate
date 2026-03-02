import { Alert, Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMovieStore } from '../store/useMovieStore';

export default function DetailsScreen({ route }) {
  const { movie } = route.params;

  // Використовуємо селектори для надійності
  const users = useMovieStore((state) => state.users);
  const toggleFavorite = useMovieStore((state) => state.toggleFavorite);
  const isFavorite = useMovieStore((state) => state.isFavorite);
  const currentUserId = useMovieStore((state) => state.currentUserId);

  // Отримуємо статус "улюбленого"
  const liked = isFavorite(movie.id);

  // Очищення опису від HTML тегів (про всяк випадок для TMDB)
  const summary = movie.summary ? movie.summary.replace(/<[^>]+>/g, '') : 'Опис відсутній';

  const handleToggleFavorite = () => {
    if (!currentUserId) {
      Alert.alert(
        "Потрібен вхід",
        "Будь ласка, увійдіть або зареєструйтеся, щоб зберігати фільми в обране.",
        [{ text: "OK" }]
      );
      return;
    }
    toggleFavorite(movie);
  };

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: movie.image?.medium || movie.image?.original || 'https://via.placeholder.com/300x400' }} 
        style={styles.poster} 
      />
      <View style={styles.content}>
        <Text style={styles.title}>{movie.name}</Text>
        <Text style={styles.info}>⭐ Рейтинг: {movie.rating?.average ? movie.rating.average.toFixed(1) : 'N/A'}</Text>
        
        {movie.genres && (
          <Text style={styles.info}>Жанри: {movie.genres.join(', ')}</Text>
        )}
        
        <View style={styles.btnContainer}>
          <Button 
            title={liked ? "Видалити з улюблених" : "Додати в улюблені"} 
            color={liked ? "#ff4444" : "#e91e63"}
            onPress={handleToggleFavorite}
          />
        </View>

        <Text style={styles.summaryTitle}>Сюжет:</Text>
        <Text style={styles.summary}>{summary}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  poster: { width: '100%', height: 450, resizeMode: 'cover' },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, color: '#1a1a1a' },
  info: { fontSize: 16, color: '#555', marginBottom: 5 },
  btnContainer: { marginVertical: 15 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, color: '#1a1a1a' },
  summary: { fontSize: 16, lineHeight: 24, marginTop: 5, color: '#333', textAlign: 'justify' }
});