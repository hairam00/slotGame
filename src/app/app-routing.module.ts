import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SlotMachineComponent } from './slot-machine/slot-machine.component';

const routes: Routes = [
  { path: 'slot-machine', component: SlotMachineComponent },
  { path: '', redirectTo: '/slot-machine', pathMatch: 'full' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
