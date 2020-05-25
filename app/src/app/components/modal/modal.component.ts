import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-window',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @Input() modalTitle = "Titulo";

  @Input() modalType:'dialog'|'info' = "dialog";
  
  @Input() confirmText:string = "Aceptar";
  @Input() cancelText:string = "Cerrar";
  @Input() showModal:boolean = false;

  @Input() customClass:string = 'modal-lg';

  @Output() result = new EventEmitter<'confirm'|'cancel'>();

  @ViewChild('modalWindow', { static: true }) modalWindow: ModalDirective;

  constructor() { }

  ngOnInit(): void { }

  ngOnChanges() {
    if (this.showModal) {
      this.modalWindow.config = {
        ignoreBackdropClick: true,
        keyboard: false,
      };
      this.modalWindow.show();
    }
    else
      this.modalWindow.hide();
  }

  confirm() {
    this.result.emit('confirm');
  }

  cancel() {
    this.result.emit('cancel');
  }

}
