export const apiBase = 'http://92.92.192.178:3000/';
export const apiVersion = 'v1/';

export const environment = {
  production: false,
  api: {
    login: apiBase + apiVersion + 'users/login',
    register: apiBase + apiVersion + 'users/',
    profile: apiBase + apiVersion + 'users/',
    user: apiBase + apiVersion + 'users/',
    character: apiBase + apiVersion + 'character',
    characters: apiBase + apiVersion + 'characters',
    combat: apiBase + apiVersion + 'combat',
    items: apiBase + apiVersion + 'items'
  }
};
