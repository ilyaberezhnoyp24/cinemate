import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMovieStore } from '../store/useMovieStore';

const API_KEY = 'f3136108c14915de5c59ee5d1028aed7'; // Перевір, щоб тут був твій ключ

// Словник: перетворюємо те, що ввів юзер, у ID для API
const GENRE_MAP = {
  "екшн": 28, "action": 28, "бойовик": 28,
  "комедія": 35, "comedy": 35,
  "драма": 18, "drama": 18,
  "жахи": 27, "horror": 27,
  "фантастика": 878, "sci-fi": 878,
  "мультфільм": 16, "animation": 16,
  "трилер": 53, "thriller": 53
};

export default function RecommendationScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Отримуємо юзера прямо зі стора
  const users = useMovieStore(state => state.users);
  const currentUserId = useMovieStore(state => state.currentUserId);
  const user = users.find(u => u.id === currentUserId);

  useEffect(() => {
    if (user?.genre) {
      fetchRecommendations();
    }
  }, [user?.genre]); // Перезавантажити, якщо жанр змінився

  const fetchRecommendations = async () => {
    setLoading(true);
    // Беремо жанр юзера, переводимо в нижній регістр і шукаємо ID
    const userGenre = user.genre.toLowerCase().trim();
    const genreId = GENRE_MAP[userGenre] || 28; // Якщо не знайшли — даємо Action за дефолтом

    try {
      // Запит: сортуємо за популярністю, мінімум 500 голосів, мова укр.
      const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&vote_count.gte=500&language=uk-UA`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results) {
        setMovies(data.results);
      }
    } catch (error) {
      console.error("Помилка рекомендацій:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Увійдіть у профіль, щоб отримати поради 🍿</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Рекомендовані {user.genre}:</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#e91e63" />
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => navigation.navigate('Details', { 
                movie: {
                  id: item.id,
                  name: item.title,
                  image: { medium: `https://image.tmdb.org/t/p/w500${item.poster_path}` },
                  summary: item.overview,
                  rating: { average: item.vote_average }
                }
              })}
            >
              <Image 
                source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }} 
                style={styles.img} 
              />
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.rating}>⭐ {item.vote_average.toFixed(1)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  card: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#f9f9f9', borderRadius: 10, overflow: 'hidden', elevation: 2 },
  img: { width: 80, height: 120 },
  info: { padding: 12, flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  rating: { color: '#e91e63', fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});