import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

    private loadingStack:boolean = false;
    loadingStatus: Subject<boolean> = new Subject();

	get loading(): boolean {
		return this.loadingStack;
	}

    set loading(value) {
        this.loadingStack = value;
		this.loadingStatus.next(value);
	}
    
    showSpinner() {
        this.loading = true;
    }

    hideSpinner() {
        this.loading = false;
    }
}