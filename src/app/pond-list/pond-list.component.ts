// pond-list.component.ts
import { Component, OnInit } from '@angular/core';
import { PondService } from '../services/pond.service';
import { Pond, Sensor } from '../models/pond.model';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import moment from 'moment-timezone';

@Component({
  selector: 'app-pond-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './pond-list.component.html',
  styleUrls: ['./pond-list.component.css'],
  providers: [DatePipe]
})
export class PondListComponent implements OnInit {
  ponds: Pond[] = [];
  sensors: Sensor[] = [];
  selectedPondId: string = '';
  newPond: Pond = { id: '', name: '', location: '', sensors: [] };
  newSensor: Sensor = { type: '', readings: [] };
  showAddPondForm: boolean = false;
  showEditPondForm: boolean = false;
  selectedPond: Pond = { id: '', name: '', location: '', sensors: [] };
  sensorView: boolean = false; // Track whether we are in sensor view
  errorMessage: string = ''; // Error message variable

  constructor(private pondService: PondService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.loadPonds();
  }

  loadPonds(): void {
    this.pondService.getAllPonds().subscribe(
      (data) => {
        this.ponds = data;
      },
      (error) => {
        console.error('Error loading ponds:', error);
        alert('Failed to load ponds. Please try again later.');
      }
    );
  }

  viewSensors(pondId: string): void {
    this.selectedPondId = pondId;
    this.sensorView = true; // Switch to sensor view
    this.pondService.getSensorsByPond(pondId).subscribe(
      (data) => {
        this.sensors = data;
        // Extract the most recent reading for each sensor
        this.sensors.forEach(sensor => {
          sensor.mostRecentReading = sensor.readings.length > 0
            ? sensor.readings.reduce((latest, current) => new Date(latest.timestamp) > new Date(current.timestamp) ? latest : current)
            : undefined;
          // Convert timestamps to local time zone for display
          if (sensor.mostRecentReading) {
            sensor.mostRecentReading.timestamp = this.formatTimestampToLocalTime(sensor.mostRecentReading.timestamp);
          }
        });
      },
      (error) => {
        console.error('Error fetching sensors:', error);
        alert('Failed to load sensor data. Please try again later.');
      }
    );
  }

  formatTimestampToLocalTime(utcTimestamp: string): string {
    const utcDate = new Date(utcTimestamp);
    return this.datePipe.transform(utcDate, 'dd-MM-yyyy HH:mm:ss', 'Asia/Kolkata') || '';
  }

  backToPonds(): void {
    this.sensorView = false; // Switch back to pond list view
    this.selectedPondId = ''; // Clear selected pond ID
  }

  toggleAddPondForm(): void {
    this.showAddPondForm = !this.showAddPondForm;
    if (!this.showAddPondForm) {
      this.newPond = { id: '', name: '', location: '', sensors: [] };
      this.newSensor = { type: '', readings: [] };
      this.errorMessage = ''; // Clear error message when toggling the form
    }
  }

  addSensor(): void {
    if (this.newSensor.type) {
      this.newPond.sensors.push({ ...this.newSensor });
      this.newSensor = { type: '', readings: [] };
    }
  }

addPond(): void {
    if (this.newPond.id && this.newPond.name) {
        const currentTimeIST = moment().tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss');

        const defaultSensors: Sensor[] = [
            { type: 'pH Sensor', readings: [{ value: '7.0', timestamp: currentTimeIST }] },
            { type: 'Temperature Sensor', readings: [{ value: '25°C', timestamp: currentTimeIST }] },
            { type: 'Rain Sensor', readings: [{ value: 'No Rain', timestamp: currentTimeIST }] },
            { type: 'Oxygen Sensor', readings: [{ value: '8 mg/L', timestamp: currentTimeIST }] },
            { type: 'Water Level Sensor', readings: [{ value: 'Normal', timestamp: currentTimeIST }] }
        ];
        this.newPond.sensors = [...this.newPond.sensors, ...defaultSensors];
        
        // Call the pond service to add the new pond and handle success and error
        this.pondService.addPond(this.newPond).subscribe(
            (pond) => {
                this.ponds.push(pond);
                this.toggleAddPondForm();
                alert('Pond added successfully!');
            },
            (error) => {
                // Error callback with detailed logging and user feedback
                console.error('Error adding pond:', error);
                console.log('Full error object:', error);
                if (error.status === 409) {
                    // Display specific error message if ID conflict occurs
                    this.errorMessage = error.error || 'A pond with the same ID already exists. Please use a unique ID.';
                } else {
                    // Display a generic error message for other issues
                    this.errorMessage = 'Failed to add pond. Please check your input and try again.';
                }
            }
        );
    } else {
        alert('Please enter both Pond ID and Pond Name.');
    }
}



  editPond(pond: Pond): void {
    this.selectedPond = { ...pond }; // Copy the selected pond
    this.showEditPondForm = true;
  }

  updatePond(): void {
    if (this.selectedPond) {
      console.log('Updating pond:', this.selectedPond);
      this.pondService.updatePond(this.selectedPond).subscribe(
        (updatedPond) => {
          const index = this.ponds.findIndex(p => p.id === updatedPond.id);
          if (index !== -1) {
            this.ponds[index] = updatedPond;
          }
          this.showEditPondForm = false;
          alert('Pond updated successfully!');
        },
        (error) => {
          console.error('Error updating pond:', error);
          alert('Failed to update pond. Please try again.');
        }
      );
    }
  }

  deletePond(pondId: string): void {
    if (confirm('Are you sure you want to delete this pond?')) {
      this.pondService.deletePond(pondId).subscribe(
        () => {
          this.ponds = this.ponds.filter(p => p.id !== pondId);
          this.showEditPondForm = false;
          alert('Pond deleted successfully!');
        },
        (error) => {
          console.error('Error deleting pond:', error);
          alert('Failed to delete pond. Please try again.');
        }
      );
    }
  }

  cancelEdit(): void {
    this.showEditPondForm = false;
  }

  getSensorIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'ph sensor':
        return 'bi bi-droplet'; // Icon for pH sensor
      case 'temperature sensor':
        return 'bi bi-thermometer'; // Icon for temperature sensor
      case 'rain sensor':
        return 'bi bi-cloud-rain'; // Icon for rain sensor
      case 'oxygen sensor':
        return 'bi bi-wind'; // Icon for oxygen sensor
      case 'water level sensor':
        return 'bi bi-water'; // Icon for water level sensor
      default:
        return 'bi bi-info-circle'; // Default icon
    }
  }

  getOptimumValue(type: string): string {
    switch (type.toLowerCase()) {
      case 'ph sensor':
        return '6.5 - 8.5';
      case 'temperature sensor':
        return '20°C - 30°C';
      case 'rain sensor':
        return 'Dry/No Rain';
      case 'oxygen sensor':
        return '5 - 9 mg/L';
      case 'water level sensor':
        return 'Normal';
      default:
        return 'N/A';
    }
  }

  isOutOfRange(type: string, value: string): boolean {
    const numValue = parseFloat(value);
    switch (type.toLowerCase()) {
      case 'ph sensor':
        return numValue < 6.5 || numValue > 8.5;
      case 'temperature sensor':
        return parseFloat(value.replace('°C', '')) < 20 || parseFloat(value.replace('°C', '')) > 30;
      case 'oxygen sensor':
        return numValue < 5 || numValue > 9;
      case 'rain sensor':
        return value.toLowerCase() !== 'no rain'; // Error if it indicates rain
      case 'water level sensor':
        return value.toLowerCase() !== 'normal'; // Error if it is not "Normal"
      default:
        return false;
    }
  }

  getAlertMessage(type: string, value: string): string {
    const numValue = parseFloat(value);
    switch (type.toLowerCase()) {
      case 'ph sensor':
        if (numValue < 6.5) {
          return '⚠️ Value is below the optimum range for pH!';
        } else if (numValue > 8.5) {
          return '⚠️ Value is above the optimum range for pH!';
        }
        break;
      case 'temperature sensor':
        const tempValue = parseFloat(value.replace('°C', ''));
        if (tempValue < 20) {
          return '⚠️ Temperature is below the optimum range!';
        } else if (tempValue > 30) {
          return '⚠️ Temperature is above the optimum range!';
        }
        break;
      case 'oxygen sensor':
        if (numValue < 5) {
          return '⚠️ Oxygen level is below the optimum range!';
        } else if (numValue > 9) {
          return '⚠️ Oxygen level is above the optimum range!';
        }
        break;
      case 'rain sensor':
        if (value.toLowerCase() !== 'no rain') {
          return '⚠️ Rain detected, which is not optimal!';
        }
        break;
      case 'water level sensor':
        if (value.toLowerCase() !== 'normal') {
          return '⚠️ Abnormal water level detected!';
        }
        break;
    }
    return '';
  }
}
