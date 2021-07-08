'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form_input-type');
const inputDistance = document.querySelector('.form_input-distance');
const inputDuration = document.querySelector('.form_input-duration');
const inputCadence = document.querySelector('.form_input-cadence');
const inputElevation = document.querySelector('.form_input-elevation');

class Workout {
  type = '';
  date = new Date();
  id = String(Date.now()).slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _getDescription() {
    const type = this.type;
    this.description = `${type[0].toUpperCase() + type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this._getPace();
    this._getDescription();
  }

  _getPace() {
    this.pace = this.duration / this.distance;
    return this;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this._getSpeed();
    this._getDescription();
  }

  _getSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this;
  }
}

class App {
  #map;
  #mapEvent;
  workouts = [];
  view = 13;

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkOut.bind(this));
    inputType.addEventListener('change', this._toggelElevationField);
    containerWorkouts.addEventListener('click', this._movemap.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Need access to location');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.view);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _movemap(e) {
    //prettier-ignore
    if (!(e.target.classList.contains('workout') ||
     e.target.classList.contains('workout__title') ||
      e.target.classList.contains('workout__details'))) return;

    const listId = e.target.dataset.id;
    const listCoord = this.workouts.find(work => work.id === listId).coords;
    this.#map.setView(listCoord, this.view);
  }

  _showMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          maxWidth: 300,
          minWidth: 100,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'} ${workout.description}`
      )
      .openPopup();
  }

  _showForm(mapE) {
    form.style.display = 'grid';
    form.style.opacity = 1;
    form.classList.toggle('hidden');
    this.#mapEvent = mapE;
    inputDistance.focus();
  }

  _toggelElevationField() {
    inputCadence.closest('.form_row').classList.toggle('form_row-hidden');
    inputElevation.closest('.form_row').classList.toggle('form_row-hidden');
  }

  _showList(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
      <h2 class="workout__title" data-id="${workout.id}">${
      workout.description
    }</h2>
      <div class="workout__details" data-id="${workout.id}">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
    </div>
    <div class="workout__details" data-id="${workout.id}">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if (workout.type === 'running') {
      html += `<div class="workout__details" data-id="${workout.id}">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details" data-id="${workout.id}">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    }

    if (workout.type === 'cycling') {
      html += `<div class="workout__details" data-id="${workout.id}">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details" data-id="${workout.id}">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevation}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>`;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  _newWorkOut(e) {
    e.preventDefault();

    const dist = +inputDistance.value;
    const dur = +inputDistance.value;
    const type = inputType.value;
    const { lat, lng } = this.#mapEvent.latlng;

    let workout;

    const validNumber = function (params) {
      return params.every(val => Number.isFinite(val));
    };

    const validValue = function (params) {
      return params.every(val => val > 0);
    };

    const hideForm = function () {
      // prettier-ignore
      inputElevation.value = inputCadence.value = inputDuration.value = inputDistance.value = '';

      form.style.display = 'none';
      form.style.opacity = 0;
      form.classList.toggle('hidden');
    };

    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !validNumber([dist, dur, cadence]) ||
        !validValue([dist, dur, cadence])
      ) {
        alert('Invalid Entry!');
        return;
      }

      workout = new Running([lat, lng], dist, dur, cadence);
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (!validNumber([dist, dur, elevation]) || !validValue([dist, dur])) {
        alert('Invalid Entry!');
        return;
      }

      workout = new Cycling([lat, lng], dist, dur, elevation);
    }

    this.workouts.push(workout);

    hideForm();
    this._showList(workout);
    this._showMarker(workout);
  }
}

const app = new App();
