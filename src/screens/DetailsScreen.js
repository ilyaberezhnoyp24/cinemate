import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMovieStore } from '../store/useMovieStore';

const API_KEY = 'f3136108c14915de5c59ee5d1028aed7';

export default function DetailsScreen({ route }) {
  const { movie } = route.params;
  const [extraData, setExtraData] = useState({ cast: [], ageRating: '', countries: [] });
  const [loadingExtra, setLoadingExtra] = useState(true);

  const users = useMovieStore((state) => state.users);
  const currentUserId = useMovieStore((state) => state.currentUserId);
  const toggleFavorite = useMovieStore((state) => state.toggleFavorite);
  const isFavorite = useMovieStore((state) => state.isFavorite);

  const user = users.find(u => u.id === currentUserId);
  const theme = user?.theme || { background: '#ffffff', accent: '#e91e63', isDark: false };
  const liked = isFavorite(movie.id);

  useEffect(() => {
    fetchExtraDetails();
  }, [movie.id]);

  const fetchExtraDetails = async () => {
    try {
      // Запит на акторів (credits) та віковий рейтинг (release_dates)
      // mediaType може бути 'movie' або 'tv', TMDB потребує правильний шлях
      const type = movie.mediaType === 'tv' ? 'tv' : 'movie';
      const url = `https://api.themoviedb.org/3/${type}/${movie.id}?api_key=${API_KEY}&append_to_response=credits,release_dates,content_ratings&language=uk-UA`;
      
      const response = await fetch(url);
      const data = await response.json();

      // Отримуємо акторів (перші 5)
      const castNames = data.credits?.cast?.slice(0, 5).map(c => c.name) || [];

      // Отримуємо країни
      const countries = data.production_countries?.map(c => c.name) || [];

      // Отримуємо віковий рейтинг (для фільмів і серіалів різна структура в API)
      let age = '';
      if (type === 'movie') {
        const uaRelease = data.release_dates?.results?.find(r => r.iso_3166_1 === 'UA') || data.release_dates?.results?.find(r => r.iso_3166_1 === 'US');
        age = uaRelease?.release_dates[0]?.certification;
      } else {
        const uaRating = data.content_ratings?.results?.find(r => r.iso_3166_1 === 'UA') || data.content_ratings?.results?.find(r => r.iso_3166_1 === 'US');
        age = uaRating?.rating;
      }

      setExtraData({
        cast: castNames,
        ageRating: age || 'Н/Д',
        countries: countries
      });
    } catch (error) {
      console.error("Помилка завантаження деталей:", error);
    } finally {
      setLoadingExtra(false);
    }
  };

  const InfoRow = ({ label, value }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, { color: theme.isDark ? '#aaa' : '#666' }]}>{label}: </Text>
        <Text style={[styles.detailValue, { color: theme.isDark ? '#fff' : '#333' }]}>
          {Array.isArray(value) ? value.join(', ') : value}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Image 
        source={{ uri: movie.image?.medium || `https://image.tmdb.org/t/p/w500${movie.poster_path}` || 'https://via.placeholder.com/300x400' }} 
        style={styles.poster} 
      />
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.isDark ? '#fff' : '#1a1a1a', flex: 1 }]}>{movie.name}</Text>
          {extraData.ageRating ? (
            <View style={[styles.ageBadge, { borderColor: theme.accent }]}>
              <Text style={[styles.ageText, { color: theme.accent }]}>{extraData.ageRating}</Text>
            </View>
          ) : null}
        </View>

        <Text style={[styles.ratingText, { color: theme.accent, marginBottom: 15 }]}>
          ⭐ {movie.rating?.average ? movie.rating.average.toFixed(1) : 'N/A'} / 10
        </Text>

        <View style={[styles.detailsBox, { borderColor: theme.isDark ? '#333' : '#eee' }]}>
          <InfoRow label="Дата виходу" value={movie.premiered || movie.release_date} />
          <InfoRow label="Жанри" value={movie.genres} />
          
          {loadingExtra ? (
            <ActivityIndicator color={theme.accent} size="small" style={{ alignSelf: 'flex-start', marginTop: 5 }} />
          ) : (
            <>
              <InfoRow label="Країна" value={extraData.countries} />
              <InfoRow label="В ролях" value={extraData.cast} />
            </>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.customBtn, { backgroundColor: liked ? '#ff4444' : theme.accent }]} 
          onPress={() => {
             if (!currentUserId) return Alert.alert("Потрібен вхід");
             toggleFavorite(movie);
          }}
        >
          <Text style={styles.btnText}>{liked ? "Видалити з обраного" : "Додати в обране"}</Text>
        </TouchableOpacity>

        <Text style={[styles.summaryTitle, { color: theme.isDark ? '#fff' : '#1a1a1a' }]}>Сюжет:</Text>
        <Text style={[styles.summary, { color: theme.isDark ? '#ccc' : '#333' }]}>
          {movie.summary || "Опис відсутній"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  poster: { width: '100%', height: 500, resizeMode: 'cover' },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  title: { fontSize: 26, fontWeight: 'bold' },
  ageBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginLeft: 10 },
  ageText: { fontSize: 14, fontWeight: 'bold' },
  ratingText: { fontSize: 18, fontWeight: 'bold' },
  detailsBox: { paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, marginBottom: 20 },
  detailRow: { flexDirection: 'row', marginBottom: 6, flexWrap: 'wrap' },
  detailLabel: { fontWeight: '600', fontSize: 14 },
  detailValue: { fontSize: 14, flex: 1 },
  customBtn: { padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  summaryTitle: { fontSize: 20, fontWeight: 'bold' },
  summary: { fontSize: 16, lineHeight: 24, marginTop: 8, textAlign: 'justify' }
});