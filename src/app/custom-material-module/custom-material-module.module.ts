import { NgModule } from '@angular/core';
import { MatButtonModule, MatCheckboxModule, MatToolbarModule, MatSelectModule, MatInputModule, MatSnackBarModule, MatIconModule,
MatCardModule,
MatMenuModule,
MatTabsModule } from '@angular/material';

@NgModule({
  imports: [MatButtonModule, MatCheckboxModule, MatToolbarModule, MatSelectModule, MatInputModule, MatSnackBarModule, MatIconModule, MatCardModule, MatMenuModule, MatTabsModule],
  exports: [MatButtonModule, MatCheckboxModule, MatToolbarModule, MatSelectModule, MatInputModule, MatSnackBarModule, MatIconModule, MatCardModule, MatMenuModule, MatTabsModule],
})
export class CustomMaterialModuleModule { }
