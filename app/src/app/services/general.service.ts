import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

    private loadingStack:number = 0;
    loadingStatus: Subject<boolean> = new Subject();

	get loading(): boolean {
		return this.loadingStack > 0;
	}

    set loading(value) {
        if (value)  
            this.loadingStack += 1;
        else if (this.loadingStack > 0)
            this.loadingStack -= 1;
        else
            this.loadingStack = 0;
		this.loadingStatus.next(this.loadingStack > 0);
	}
    
    showSpinner() {
        this.loading = true;
    }

    hideSpinner() {
        this.loading = false;
    }
}