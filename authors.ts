export interface Author {
  name: string;
  avatar: string;
  bio: string;
}

export const AUTHORS: Record<string, Author> = {
  'hai-dao': {
    name: 'Hai Dao',
    avatar: '../images/avatar.png',
    bio: 'Adventurer, storyteller, and "What If" enthusiast. Exploring the world one question at a time.'
  }
};