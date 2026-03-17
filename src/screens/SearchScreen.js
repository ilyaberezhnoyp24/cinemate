import { useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMovieStore } from '../store/useMovieStore';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const users = useMovieStore(state => state.users);
  const currentUserId = useMovieStore(state => state.currentUserId);
  const user = users.find(u => u.id === currentUserId);
  const theme = user?.theme || { background: '#ffffff', accent: '#e91e63', isDark: false };

  const searchMovies = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const API_KEY = 'f3136108c14915de5c59ee5d1028aed7'; 
      const url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=uk-UA`;
      const response = await fetch(url);
      const data = await response.json();
      
      const formattedData = data.results
        .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        .map(m => ({
          show: {
            id: m.id,
            name: m.title || m.name, 
            premiered: m.release_date || m.first_air_date,
            rating: { average: m.vote_average },
            image: { medium: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null },
            summary: m.overview
          }
        }));
      setMovies(formattedData);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.searchBox}>
        <TextInput 
          style={[styles.input, { backgroundColor: theme.isDark ? '#2c2c2c' : '#fff', color: theme.isDark ? '#fff' : '#000' }]}
          placeholder="Пошук фільмів..."
          placeholderTextColor={theme.isDark ? '#888' : '#aaa'}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchMovies}
        />
        <TouchableOpacity onPress={searchMovies} style={[styles.btn, { backgroundColor: theme.accent }]}>
          <Text style={styles.btnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.show.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.isDark ? '#1e1e1e' : '#fff' }]} 
              onPress={() => navigation.navigate('Details', { movie: item.show })}
            >
              <Image source={{ uri: item.show.image?.medium || 'https://via.placeholder.com/100x150' }} style={styles.poster} />
              <View style={styles.info}>
                <Text style={[styles.title, { color: theme.isDark ? '#fff' : '#000' }]}>{item.show.name}</Text>
                <Text style={[styles.rating, { color: theme.accent }]}>⭐ {item.show.rating?.average?.toFixed(1) || '-'}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: theme.isDark ? '#666' : 'gray' }}>Нічого не знайдено</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  searchBox: { flexDirection: 'row', marginBottom: 10 },
  input: { flex: 1, padding: 12, borderRadius: 10, marginRight: 10 },
  btn: { padding: 12, borderRadius: 10, justifyContent: 'center' },
  btnText: { color: '#fff' },
  card: { flexDirection: 'row', marginBottom: 10, borderRadius: 8, overflow: 'hidden', elevation: 2 },
  poster: { width: 80, height: 120 },
  info: { padding: 10, justifyContent: 'center', flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold' },
  rating: { marginTop: 5, fontWeight: 'bold' }
});