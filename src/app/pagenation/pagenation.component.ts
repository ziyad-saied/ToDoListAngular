import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagenation',
  imports: [CommonModule],
  templateUrl: './pagenation.component.html',
  styleUrl: './pagenation.component.css'
})
export class PagenationComponent {
  @Input() currentPage: number = 0;
  @Input() totalPages: number = 0;
  @Output() pageChange = new EventEmitter<number>();

  goToFirstPage() {
    this.currentPage = 0;
    this.pageChange.emit(this.currentPage);
  }

  goToPreviousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.pageChange.emit(this.currentPage);
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.pageChange.emit(this.currentPage);
    }
  }

  goToLastPage() {
    this.currentPage = this.totalPages - 1;
    this.pageChange.emit(this.currentPage);
  }
}
