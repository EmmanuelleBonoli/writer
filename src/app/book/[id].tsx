import { useLocalSearchParams } from 'expo-router';

import { BookDetailScreen } from '@/features/books/screens/BookDetailScreen';

export default function BookDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BookDetailScreen bookId={id} />;
}
