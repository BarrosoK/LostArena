// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const apiBase = 'http://localhost:3000/';
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
  },
  pixi: {
    textStyles: {
      hitDefault: {
        'fontSize': 35,
        'dropShadow': true,
        'dropShadowAlpha': 0.4,
        'dropShadowAngle': 1,
        'dropShadowDistance': 4,
        'fill': [
          '#da4646',
          '#950909'
        ],
        'fontFamily': 'Arial Black',
        'fontStyle': 'italic',
        'fontWeight': 'bold',
        'strokeThickness': 1
      },
      hitMiss: {
        'fontSize': 40,
        'dropShadow': true,
        'dropShadowAlpha': 0.4,
        'dropShadowAngle': 1,
        'dropShadowDistance': 4,
        'fill': [
          '#4a72f6',
          '#3c5dca',
          '#193cad'
        ],
        'fontFamily': 'Arial Black',
        'fontStyle': 'italic',
        'fontWeight': 'bold',
        'strokeThickness': 1
      },
      hitCrit: {
        'fontSize': 45,
        'dropShadow': true,
        'dropShadowAlpha': 0.4,
        'dropShadowAngle': 1,
        'dropShadowDistance': 4,
        'fill': [
          '#ffcb0e',
          '#deb10d',
          '#ad9025'
        ],
        'fontFamily': 'Arial Black',
        'fontStyle': 'italic',
        'fontWeight': 'bold',
        'strokeThickness': 1
      },
      healthPercent: {
        fill: [
          '#63e882',
          '#41a746',
          '#137c28'
        ],
        fontFamily: 'Arial Black',
        fontStyle: 'italic',
        fontWeight: 'bold',
        strokeThickness: 1
      },
      name: {
        fill: [
          '#4163ec',
          '#5267bb',
          '#08195f'
        ],
        fontFamily: 'Roboto',
        fontStyle: 'italic',
        fontWeight: 'bold',
        strokeThickness: 1
      }
    }
  },
  gameConfig: {
    combat: {
      speed: 8,
      time_scale: 1.80,
      default_y: 500,
      spawn: {
        player: 200,
        enemy: 600
      },
      ui: {
        name_up: false,
        progress_bar: {
          offset: 0,
          width: 300,
          heigth: 30,
          border: 3.5
        }
      }
    }
  }
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
