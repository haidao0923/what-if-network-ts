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
  },
  'johnny-test': {
    name: 'Johnny Test',
    avatar: 'https://ui-avatars.com/api/?name=Johnny+Test&background=FF00FF&color=fff',
    bio: 'Johnny Test is testing some stuffs.'
  }
};