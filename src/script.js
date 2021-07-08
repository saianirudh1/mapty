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
  #date = new Date();
  #id = String(Date.now()).slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _getDescription() {
    const type = this.type;
    this.description = `${type[0].toUpperCase() + type.slice(1)} on ${
      months[this.#date.getMonth()]
    } ${this.#date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this._getSpeed();
    this._getDescription();
  }

  _getSpeed() {
    this.speed = this.duration / this.distance;
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

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkOut.bind(this));
    inputType.addEventListener('change', this._toggelElevationField);
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

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    form.classList.toggle('hidden');
    this.#mapEvent = mapE;
    inputDistance.focus();
  }

  _toggelElevationField() {
    inputCadence.closest('.form_row').classList.toggle('form_row-hidden');
    inputElevation.closest('.form_row').classList.toggle('form_row-hidden');
  }

  _newWorkOut(e) {
    e.preventDefault();

    const dist = inputDistance.value;
    const dur = inputDistance.value;
    const type = inputType.value;

    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';

    const { lat, lng } = this.#mapEvent.latlng;

    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          maxWidth: 300,
          minWidth: 100,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('Workout')
      .openPopup();

    form.classList.toggle('hidden');
  }
}

const app = new App();
