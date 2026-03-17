import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMovieStore } from '../store/useMovieStore';

const API_KEY = 'f3136108c14915de5c59ee5d1028aed7';

const GENRE_MAP = {
  "екшн": 28, "комедія": 35, "драма": 18, "жахи": 27,
  "фантастика": 878, "мультфільм": 16, "трилер": 53
};

export default function RecommendationScreen({ navigation }) {
  const [mixedMovies, setMixedMovies] = useState([]); 
  const [categorizedMovies, setCategorizedMovies] = useState({});
  const [loading, setLoading] = useState(false);
  
  const users = useMovieStore(state => state.users);
  const currentUserId = useMovieStore(state => state.currentUserId);
  const user = users.find(u => u.id === currentUserId);

  // Отримуємо тему користувача
  const theme = user?.theme || { background: '#ffffff', accent: '#e91e63', isDark: false };

  useEffect(() => {
    if (user?.genres && user.genres.length > 0) {
      fetchAllRecommendations();
    }
  }, [user?.genres]);

  const fetchAllRecommendations = async () => {
    setLoading(true);
    const genreIds = user.genres.map(g => GENRE_MAP[g.toLowerCase().trim()]).filter(id => id);
    if (genreIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const mixUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreIds.join(',')}&sort_by=popularity.desc&vote_count.gte=300&language=uk-UA`;
      const mixResponse = await fetch(mixUrl);
      const mixData = await mixResponse.json();

      const sortedMixed = mixData.results.sort((a, b) => {
        const aMatches = a.genre_ids.filter(id => genreIds.includes(id)).length;
        const bMatches = b.genre_ids.filter(id => genreIds.includes(id)).length;
        return bMatches - aMatches; 
      });
      setMixedMovies(sortedMixed);

      const categoryResults = {};
      for (const genreName of user.genres) {
        const id = GENRE_MAP[genreName.toLowerCase().trim()];
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${id}&sort_by=vote_average.desc&vote_count.gte=500&language=uk-UA`;
        const res = await fetch(url);
        const data = await res.json();
        categoryResults[genreName] = data.results.slice(0, 10);
      }
      setCategorizedMovies(categoryResults);
    } catch (error) {
      console.error("Помилка рекомендацій:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMovieItem = (item) => (
    <TouchableOpacity 
      key={item.id}
      style={[styles.card, { backgroundColor: theme.isDark ? '#1e1e1e' : '#f9f9f9' }]} 
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
        <Text style={[styles.title, { color: theme.isDark ? '#fff' : '#333' }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.rating, { color: theme.accent }]}>⭐ {item.vote_average.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!user || !user.genres || user.genres.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.emptyText, { color: theme.isDark ? '#aaa' : '#666' }]}>
            Оберіть улюблені жанри в профілі, щоб ми підібрали фільми 🍿
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.isDark ? '#fff' : '#333' }]}>Для тебе (все разом):</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} />
      ) : (
        <>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={mixedMovies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderMovieItem(item)}
            style={styles.horizontalList}
          />

          {Object.keys(categorizedMovies).map(genre => (
            <View key={genre} style={styles.section}>
              <Text style={[styles.subHeader, { color: theme.accent }]}>Найкраще: {genre}</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categorizedMovies[genre]}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => renderMovieItem(item)}
              />
            </View>
          ))}
        </>
      )}
      <View style={{height: 40}} /> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  section: { marginTop: 20 },
  horizontalList: { marginBottom: 10 },
  card: { width: 130, marginRight: 15, borderRadius: 10, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  img: { width: 130, height: 180 },
  info: { padding: 8 },
  title: { fontSize: 14, fontWeight: 'bold' },
  rating: { fontSize: 12, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { textAlign: 'center', fontSize: 16 }
});