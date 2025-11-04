import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslocoPipe } from '@jsverse/transloco';
import { UserService } from '../../../../../core/services/user.service';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    FloatLabelModule,
    TranslocoPipe
  ],
  template: `
    <div class="space-y-4 border-t pt-2 mt-4">
      <!-- Header -->
      <h3 class="font-semibold text-sm text-slate-700">
        {{ title || 'Select Users' }}
      </h3>

      <!-- Search and Add Users -->
      <div class="space-y-2">
        <label class="block text-xs text-slate-600">{{ "Search Users" | transloco }}</label>
        <p-floatlabel variant="on">
          <p-select 
            [(ngModel)]="selectedUser"
            [options]="availableUsers"
            optionLabel="fullName"
            optionValue="userId"
            placeholder=""
            filter="true"
            filterBy="fullName,userName,email"
            [showClear]="true"
            styleClass="w-full"
            appendTo="body"
            (onChange)="onUserSelected()">
            <ng-template #item let-user>
              <div class="flex flex-col">
                <span class="font-medium">{{ user.fullName }}</span>
                <span class="text-xs text-slate-500">{{ user.email }}</span>
              </div>
            </ng-template>
          </p-select>
          <label>{{ "Select a user to add" | transloco }}</label>
        </p-floatlabel>
      </div>

      <!-- Selected Users List -->
      @if (selectedUserIds.length > 0) {
        <div class="space-y-2">
          <label class="block text-xs text-slate-600 font-medium">{{ "Selected Users" | transloco }}</label>
          <div class="border border-slate-200 rounded-lg divide-y divide-slate-200">
            @for (userId of selectedUserIds; track userId) {
              <div class="flex items-center justify-between p-2 hover:bg-slate-50">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-sm text-primary-600">person</span>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium">{{ getUserName(userId) }}</span>
                    <span class="text-xs text-slate-500">{{ getUserEmail(userId) }}</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  (click)="removeUser(userId)"
                  class="text-red-500 hover:text-red-700 p-1">
                  <span class="material-icons text-sm">close</span>
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (selectedUserIds.length === 0) {
        <div class="border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500 text-sm">
          <span class="material-icons text-3xl mb-2 text-slate-400">person_add</span>
          <p>{{ "No users selected" | transloco }}</p>
          <p class="text-xs mt-1">{{ "Search and select users above" | transloco }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class UserSelectorComponent implements OnInit {
  @Input() nodeId: string = '';
  @Input() title?: string;
  @Input() currentValue: number[] | null = null;
  
  @Output() selectionChange = new EventEmitter<number[]>();

  // Services
  private userService = inject(UserService);

  // Data sources
  users: any[] = [];

  // Selected items
  selectedUserIds: number[] = [];

  // Temporary selection holder
  selectedUser: number | null = null;

  ngOnInit() {
    this.loadData();
    
    // Initialize with current value if provided
    if (this.currentValue) {
      this.selectedUserIds = this.currentValue;
    }
  }

  private loadData() {
    // Load users
    this.userService.getUsers().subscribe((res: any) => {
      this.users = res['results'] || res || [];
    });
  }

  // Computed property - users not yet selected
  get availableUsers(): any[] {
    return this.users.filter(u => !this.selectedUserIds.includes(u.userId));
  }

  onUserSelected() {
    if (this.selectedUser && !this.selectedUserIds.includes(this.selectedUser)) {
      this.selectedUserIds.push(this.selectedUser);
      this.selectedUser = null; // Clear selection
      this.onSelectionChange();
    }
  }

  removeUser(userId: number) {
    this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
    this.onSelectionChange();
  }

  // Helper methods to get display names
  getUserName(userId: number): string {
    const user = this.users.find(u => u.userId === userId);
    return user?.fullName || 'Unknown User';
  }

  getUserEmail(userId: number): string {
    const user = this.users.find(u => u.userId === userId);
    return user?.email || '';
  }

  onSelectionChange() {
    this.selectionChange.emit(this.selectedUserIds);
  }

  // Public method to validate
  isValid(): boolean {
    return this.selectedUserIds.length > 0;
  }

  // Public method to get all values
  getValue(): number[] {
    return this.selectedUserIds;
  }
}
