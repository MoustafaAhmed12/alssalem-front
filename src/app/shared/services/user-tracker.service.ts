import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../../authentication/services/auth.service';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserTrackerService {
  authService = inject(AuthService);
  private hubConnection: HubConnection | undefined;
  public onlineUsersCount = signal<number>(0);

  constructor() {}

  public startConnection = () => {
    const token = this.authService.getToken();
    if (!token) {
      console.log('No token found, skipping SignalR connection');
      return;
    }

    if (
      this.hubConnection?.state === HubConnectionState.Connected ||
      this.hubConnection?.state === HubConnectionState.Connecting
    ) {
      return;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.BASE_URL}/hubs/online-users`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();
    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log('Error while starting connection: ' + err));

    this.hubConnection.on('OnlineUsersCout', (count: number) => {
      this.onlineUsersCount.set(count);
    });
  };

  public stopConnection = () => {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection
        .stop()
        .then(() => console.log('Connection stopped'))
        .catch((err) => console.log('Error while stopping connection: ' + err));
    }
  };
}
