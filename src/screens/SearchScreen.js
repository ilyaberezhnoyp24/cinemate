import { useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchMovies = async () => {
  if (!query) return;
    setLoading(true);
  try {
    // Використовуємо TMDB API (шукає фільми + підтримка української)
    const API_KEY = 'f3136108c14915de5c59ee5d1028aed7'; // Сюди треба вставити ключ, або використати проксі
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=uk-UA`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Фільтруємо, щоб залишити тільки фільми (movie) та серіали (tv)
    const formattedData = data.results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .map(m => ({
        show: {
          id: m.id,
          // У фільмів поле 'title', у серіалів 'name'
          name: m.title || m.name, 
          // У фільмів 'release_date', у серіалів 'first_air_date'
          premiered: m.release_date || m.first_air_date,
          rating: { average: m.vote_average },
          image: { medium: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null },
          summary: m.overview,
          mediaType: m.media_type // додаємо тип, щоб знати, що це
        }
      }));
    
    setMovies(formattedData);
  } catch (error) {
    console.error("Помилка пошуку:", error);
  } finally {
    setLoading(false);
  }
  };

  const renderItem = ({ item }) => {
    const movie = item.show;
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('Details', { movie })}
      >
        <Image 
          source={{ uri: movie.image?.medium || 'https://via.placeholder.com/100x150' }} 
          style={styles.poster} 
        />
        <View style={styles.info}>
          <Text style={styles.title}>{movie.name}</Text>
          <Text style={styles.year}>{movie.premiered ? movie.premiered.slice(0, 4) : 'N/A'}</Text>
          <Text style={styles.rating}>⭐ {movie.rating?.average || '-'}/10</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput 
          style={styles.input}
          placeholder="Введіть назву (напр. Matrix)..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchMovies}
        />
        <TouchableOpacity onPress={searchMovies} style={styles.btn}>
          <Text style={styles.btnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#e91e63" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.show.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Введіть запит для пошуку</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f0f0f0' },
  searchBox: { flexDirection: 'row', marginBottom: 10 },
  input: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 8, marginRight: 10 },
  btn: { backgroundColor: '#e91e63', padding: 10, borderRadius: 8, justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginBottom: 10, borderRadius: 8, overflow: 'hidden', elevation: 2 },
  poster: { width: 80, height: 120 },
  info: { padding: 10, justifyContent: 'center', flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold' },
  year: { color: 'gray' },
  rating: { marginTop: 5, color: '#e91e63', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: 'gray' }
});