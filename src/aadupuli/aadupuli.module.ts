import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgbModule, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AadupuliComponent } from './aadupuli.component';
import { WindowRef } from './windowref.service';
import { HttpModule } from '@angular/http';

@NgModule({
  declarations: [
    AadupuliComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgbModule.forRoot()
  ],
  providers: [
    WindowRef
  ],
  bootstrap: [AadupuliComponent]
})
export class AadupuliModule { }
