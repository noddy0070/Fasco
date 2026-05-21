import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStore } from '../../../core/store/admin-store';

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './analytics.html',
    styleUrl: './analytics.css',
})
export class Analytics implements OnInit {
    private readonly adminStore = inject(AdminStore);

    readonly overview = computed(() => this.adminStore.overview());
    readonly revenueChart = computed(() => this.adminStore.revenueChart());
    readonly orderStatusBreakdown = computed(() => this.adminStore.orderStatusBreakdown());
    readonly topProducts = computed(() => this.adminStore.topProducts());
    readonly isLoading = computed(() => this.adminStore.isLoading());
    readonly error = computed(() => this.adminStore.error());

    readonly maxRevenue = computed(() => {
        const values = this.revenueChart().map((d) => d.revenue);
        return values.length ? Math.max(...values) : 1;
    });

    ngOnInit(): void {
        this.adminStore.loadAnalytics();
    }
}
