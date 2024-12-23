import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';

export default class SalesOrdersIndexController extends Controller {
    /**
     * Inject the `notifications` service
     *
     * @var {Service}
     */
    @service notifications;

    /**
     * Inject the `modals-manager` service
     *
     * @var {Service}
     */
    @service modalsManager;

    /**
     * Inject the `crud` service
     *
     * @var {Service}
     */
    @service crud;

    /**
     * Inject the `store` service
     *
     * @var {Service}
     */
    @service store;

    /**
     * Inject the `hostRouter` service
     *
     * @var {Service}
     */
    @service hostRouter;

    /**
     * Inject the `contextPanel` service
     *
     * @var {Service}
     */
    @service contextPanel;

    /**
     * Inject the `filters` service
     *
     * @var {Service}
     */
    @service filters;

    /**
     * Inject the `loader` service
     *
     * @var {Service}
     */
    @service loader;

    /**
     * Queryable parameters for this controller's model
     *
     * @var {Array}
     */
    queryParams = ['page', 'limit', 'sort', 'query', 'public_id', 'created_by', 'updated_by', 'status', 'delivered_at'];

    /**
     * The current page of data being viewed
     *
     * @var {Integer}
     */
    @tracked page = 1;

    /**
     * The maximum number of items to show per page
     *
     * @var {Integer}
     */
    @tracked limit;

    /**
     * The param to sort the data on, the param with prepended `-` is descending
     *
     * @var {String}
     */
    @tracked sort = '-created_at';

    /**
     * The filterable param `public_id`
     *
     * @var {String}
     */
    @tracked public_id;

    /**
     * The filterable param `status`
     *
     * @var {Array}
     */
    @tracked status;

    /**
     * All columns applicable for orders
     *
     * @var {Array}
     */
    @tracked columns = [
        {
            label: 'ID',
            valuePath: 'public_id',
            width: '130px',
            cellComponent: 'table/cell/anchor',
            action: this.viewSalesOrder,
            resizable: true,
            sortable: true,
            filterable: true,
            hidden: false,
            filterComponent: 'filter/string',
        },
        {
            label: 'Comments',
            valuePath: 'comments',
            width: '130px',
            cellComponent: 'table/cell/anchor',
            resizable: true,
            sortable: true,
            filterable: true,
            hidden: false,
            filterComponent: 'filter/string',
        },
        {
            label: 'Status',
            valuePath: 'status',
            cellComponent: 'table/cell/status',
            width: '100px',
            resizable: true,
            sortable: true,
            filterable: true,
            filterComponent: 'filter/multi-option',
            filterOptions: this.statusOption,
        },
        {
            label: 'Created At',
            valuePath: 'createdAt',
            sortParam: 'createdAt',
            width: '120px',
            resizable: true,
            sortable: true,
            filterable: true,
            filterComponent: 'filter/date',
        },
        {
            label: 'Updated At',
            valuePath: 'updatedAt',
            sortParam: 'updated_at',
            width: '120px',
            resizable: true,
            sortable: true,
            hidden: true,
            filterable: true,
            filterComponent: 'filter/date',
        },
        {
            label: '',
            cellComponent: 'table/cell/dropdown',
            ddButtonText: false,
            ddButtonIcon: 'ellipsis-h',
            ddButtonIconPrefix: 'fas',
            ddMenuLabel: 'Sales Order Actions',
            cellClassNames: 'overflow-visible',
            wrapperClass: 'flex items-center justify-end mx-2',
            width: '10%',
            actions: [
                {
                    label: 'View Details',
                    fn: this.viewSalesOrder,
                },
                {
                    label: 'Edit Sales Order',
                    fn: this.editSalesOrder,
                },
                {
                    separator: true,
                },
                {
                    label: 'Delete Sales Order',
                    fn: this.deleteSalesOrder,
                },
            ],
            sortable: false,
            filterable: false,
            resizable: false,
            searchable: false,
        },
    ];

    /**
     * The search task.
     *
     * @void
     */
    @task({ restartable: true }) *search({ target: { value } }) {
        // if no query don't search
        if (isBlank(value)) {
            this.query = null;
            return;
        }

        // timeout for typing
        yield timeout(250);

        // reset page for results
        if (this.page > 1) {
            this.page = 1;
        }

        // update the query param
        this.query = value;
    }

    /**
     * Toggles dialog to export a Sales Order
     *
     * @void
     */
    @action exportFuelReports() {
        this.crud.export('sales-order');
    }

    /**
     * View the selected Sales Order
     *
     * @param {SalesOrderModel} fuelReport
     * @param {Object} options
     * @void
     */
    @action viewSalesOrder(salesOrder) {
        this.hostRouter.transitionTo('console.pallet.sales-orders.index.details', salesOrder);
    }

    /**
     * Create a new Sales Order
     *
     * @void
     */
    @action createSalesOrder() {
        this.hostRouter.transitionTo('console.pallet.sales-orders.index.new');
    }

    /**
     * Edit a Sales Order
     *
     * @param {SalesOrderModel} salesOrder
     * @void
     */
    @action editSalesOrder(salesOrder) {
        this.hostRouter.transitionTo('console.pallet.sales-orders.index.edit', salesOrder);
    }

    /**
     * Prompt to delete a Sales Order
     *
     * @param {SalesOrderModel} salesOrder
     * @param {Object} options
     * @void
     */
    @action deleteSalesOrder(salesOrder, options = {}) {
        this.crud.delete(salesOrder, {
            onConfirm: () => {
                this.hostRouter.refresh();
            },
            ...options,
        });
    }

    /**
     * Bulk deletes selected Sales Order's via confirm prompt
     *
     * @param {Array} selected an array of selected models
     * @void
     */
    @action bulkDeleteSalesOrders() {
        const selected = this.table.selectedRows;

        this.crud.bulkDelete(selected, {
            modelNamePath: 'public_id',
            acceptButtonText: 'Delete Sales Orders',
            fetchOptions: {
                namespace: 'pallet/int/v1',
            },
            onSuccess: () => {
                return this.hostRouter.refresh();
            },
        });
    }
}
