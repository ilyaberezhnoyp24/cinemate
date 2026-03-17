import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useMovieStore } from '../store/useMovieStore'; // Імпортуємо стор

import DetailsScreen from '../screens/DetailsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RecommendationScreen from '../screens/RecommendationScreen';
import SearchScreen from '../screens/SearchScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  // Отримуємо поточного юзера та його тему
  const users = useMovieStore(state => state.users);
  const currentUserId = useMovieStore(state => state.currentUserId);
  const user = users.find(u => u.id === currentUserId);
  
  // Якщо юзер не залогінений або не вибрав колір — ставимо дефолтний рожевий
  const accentColor = user?.theme?.accent || '#e91e63';
  const isDark = user?.theme?.isDark || false;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Search') iconName = 'search';
          else if (route.name === 'Recommendations') iconName = 'sparkles';
          else if (route.name === 'Favorites') iconName = 'heart';
          else if (route.name === 'Profile') iconName = 'person-circle';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Використовуємо акцентний колір зі стора
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: 'gray',
        // Стилізація фону самої панелі вкладок під тему
        tabBarStyle: {
          backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
          borderTopColor: isDark ? '#333' : '#ddd',
        },
        headerStyle: {
          backgroundColor: isDark ? '#121212' : '#ffffff',
        },
        headerTitleStyle: {
          color: isDark ? '#ffffff' : '#000000',
        }
      })}
    >
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Пошук' }} />
      <Tab.Screen name="Recommendations" component={RecommendationScreen} options={{ title: 'Для тебе' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Улюблені' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профіль' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const users = useMovieStore(state => state.users);
  const currentUserId = useMovieStore(state => state.currentUserId);
  const user = users.find(u => u.id === currentUserId);
  const isDark = user?.theme?.isDark || false;

  return (
    // Застосовуємо системну тему NavigationContainer для повної підтримки
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen 
          name="Details" 
          component={DetailsScreen} 
          options={{ 
            title: 'Про фільм',
            headerTintColor: user?.theme?.accent || '#e91e63' // Колір кнопки "Назад"
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}