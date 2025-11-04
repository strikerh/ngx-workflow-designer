import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslocoPipe } from '@jsverse/transloco';
import { SettingService } from '../../../../../core/services/setting-service.service';

@Component({
  selector: 'app-user-group-selector',
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
        {{ title || 'Select User Groups' }}
      </h3>

      <!-- Search and Add User Groups -->
      <div class="space-y-2">
        <!-- <label class="block text-xs text-slate-600">{{ "Search User Groups" | transloco }}</label> -->
        <p-floatlabel variant="on">
          <p-select 
            [(ngModel)]="selectedUserGroup"
            [options]="availableUserGroups"
            optionLabel="name"
            optionValue="notificationID"
            placeholder=""
            filter="true"
            filterBy="name,description"
            [showClear]="true"
            styleClass="w-full"
            appendTo="body"
            (onChange)="onUserGroupSelected()">
            <ng-template #item let-group>
              <div class="flex flex-col">
                <span class="font-medium">{{ group.name }}</span>
                @if (group.description) {
                  <span class="text-xs text-slate-500">{{ group.description }}</span>
                }
              </div>
            </ng-template>
          </p-select>
          <label>{{ "Select a user group to add" | transloco }}</label>
        </p-floatlabel>
      </div>

      <!-- Selected User Groups List -->
      @if (selectedUserGroupIds.length > 0) {
        <div class="space-y-2">
          <label class="block text-xs text-slate-600 font-medium">{{ "Selected User Groups" | transloco }}</label>
          <div class="border border-slate-200 rounded-lg divide-y divide-slate-200">
            @for (groupId of selectedUserGroupIds; track groupId) {
              <div class="flex items-center justify-between p-2 hover:bg-slate-50">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-sm text-primary-600">groups</span>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium">{{ getUserGroupName(groupId) }}</span>
                    <span class="text-xs text-slate-500">{{ getUserGroupDescription(groupId) }}</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  (click)="removeUserGroup(groupId)"
                  class="text-red-500 hover:text-red-700 p-1">
                  <span class="material-icons text-sm">close</span>
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (selectedUserGroupIds.length === 0) {
        <div class="border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500 text-sm">
          <span class="material-icons text-3xl mb-2 text-slate-400">group_add</span>
          <p>{{ "No user groups selected" | transloco }}</p>
          <p class="text-xs mt-1">{{ "Search and select user groups above" | transloco }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class UserGroupSelectorComponent implements OnInit {
  @Input() nodeId: string = '';
  @Input() title?: string;
  @Input() currentValue: number[] | null = null;
  
  @Output() selectionChange = new EventEmitter<number[]>();

  // Services
  private settingService = inject(SettingService);

  // Data sources
  notificationUsers: any[] = [];

  // Selected items
  selectedUserGroupIds: number[] = [];

  // Temporary selection holder
  selectedUserGroup: number | null = null;

  ngOnInit() {
    this.loadData();
    
    // Initialize with current value if provided
    if (this.currentValue) {
      this.selectedUserGroupIds = this.currentValue;
    }
  }

  private loadData() {
    // Load notification users
    this.settingService.getNotificationUsers().subscribe((res: any) => {
      this.notificationUsers = res['results'] || res || [];
    });
  }

  // Computed property - user groups not yet selected
  get availableUserGroups(): any[] {
    return this.notificationUsers.filter(g => !this.selectedUserGroupIds.includes(g.notificationID));
  }

  onUserGroupSelected() {
    if (this.selectedUserGroup && !this.selectedUserGroupIds.includes(this.selectedUserGroup)) {
      this.selectedUserGroupIds.push(this.selectedUserGroup);
      this.selectedUserGroup = null; // Clear selection
      this.onSelectionChange();
    }
  }

  removeUserGroup(groupId: number) {
    this.selectedUserGroupIds = this.selectedUserGroupIds.filter(id => id !== groupId);
    this.onSelectionChange();
  }

  // Helper methods to get display names
  getUserGroupName(groupId: number): string {
    const group = this.notificationUsers.find(g => g.notificationID === groupId);
    return group?.name || 'Unknown Group';
  }

  getUserGroupDescription(groupId: number): string {
    const group = this.notificationUsers.find(g => g.notificationID === groupId);
    return group?.description || '';
  }

  onSelectionChange() {
    this.selectionChange.emit(this.selectedUserGroupIds);
  }

  // Public method to validate
  isValid(): boolean {
    return this.selectedUserGroupIds.length > 0;
  }

  // Public method to get all values
  getValue(): number[] {
    return this.selectedUserGroupIds;
  }
}
