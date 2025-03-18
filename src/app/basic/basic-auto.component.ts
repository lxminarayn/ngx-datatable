import { Component, inject } from '@angular/core';
import { ColumnMode, TableColumn } from 'projects/ngx-datatable/src/public-api';
import { Employee } from '../data.model';
import { DataService } from '../data.service';

@Component({
  selector: 'basic-auto-demo',
  template: `
    <div>
      <h3>
        Fluid Row Heights
        <small>
          <a
            href="https://github.com/siemens/ngx-datatable/blob/master/src/app/basic/basic-auto.component.ts"
            target="_blank"
          >
            Source
          </a>
        </small>
      </h3>
      <ngx-datatable
        class="material"
        [rows]="rows"
        [loadingIndicator]="loadingIndicator"
        [columns]="columns"
        [columnMode]="ColumnMode.force"
        [headerHeight]="50"
        [footerHeight]="50"
        rowHeight="auto"
        [reorderable]="reorderable"
      >
      </ngx-datatable>
    </div>
  `
})
export class BasicAutoComponent {
  rows: Employee[] = [];
  loadingIndicator = true;
  reorderable = true;

  columns: TableColumn[] = [
    { prop: 'name' },
    { name: 'Gender' },
    { name: 'Company', sortable: false }
  ];

  ColumnMode = ColumnMode;

  private dataService = inject(DataService);

  constructor() {
    this.dataService.load('company.json').subscribe(data => {
      this.rows = data;
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 1500);
    });
  }
}
