import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-window',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @Input() modalTitle = "Titulo";

  /**
   * Can be dialog or confirm
   */
  @Input() modalType = "dialog";
  
  @Input() confirmText = "Aceptar";
  @Input() cancelText = "Cerrar";
  @Input() showModal:boolean;

  @Output() correcto = new EventEmitter<boolean>();

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
    this.correcto.emit( true );
  }

  cancel() {
    this.correcto.emit( false );
  }

}
