import { NgModule } from '@angular/core';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatToolbarModule,
  MatSelectModule,
  MatInputModule,
  MatSnackBarModule,
  MatIconModule,
  MatCardModule,
  MatMenuModule,
  MatTabsModule,
  MatExpansionModule,
  MatDialogModule,
  MatBottomSheetModule
} from '@angular/material';

const materialModules = [
  MatButtonModule,
  MatCheckboxModule,
  MatToolbarModule,
  MatSelectModule,
  MatInputModule,
  MatSnackBarModule,
  MatIconModule,
  MatCardModule,
  MatMenuModule,
  MatTabsModule,
  MatExpansionModule,
  MatDialogModule,
  MatBottomSheetModule];

@NgModule({
  imports: materialModules,
  exports: materialModules,
})
export class CustomMaterialModuleModule { }
