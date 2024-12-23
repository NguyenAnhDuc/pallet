import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
export default class SuppliersIndexEditController extends Controller {
    /**
     * Inject the `hostRouter` service
     *
     * @memberof ManagementSuppliersIndexEditController
     */
    @service hostRouter;

    /**
     * Inject the `hostRouter` service
     *
     * @memberof ManagementSuppliersIndexEditController
     */
    @service modalsManager;

    /**
     * The overlay component context.
     *
     * @memberof ManagementSuppliersIndexEditController
     */
    @tracked overlay;

    /**
     * When exiting the overlay.
     *
     * @return {Transition}
     * @memberof ManagementSuppliersIndexEditController
     */
    @action transitionBack(supplier) {
        // check if supplier record has been edited and prompt for confirmation
        if (supplier.hasDirtyAttributes) {
            return this.confirmContinueWithUnsavedChanges(supplier, {
                confirm: () => {
                    supplier.rollbackAttributes();
                    return this.hostRouter.transitionTo('console.pallet.supplier.index');
                },
            });
        }

        return this.hostRouter.transitionTo('console.pallet.supplier.index');
    }

    /**
     * Set the overlay component context object.
     *
     * @param {OverlayContext} overlay
     * @memberof ManagementSuppliersIndexEditController
     */
    @action setOverlayContext(overlay) {
        this.overlay = overlay;
    }

    /**
     * When supplier details button is clicked in overlay.
     *
     * @param {SupplierModel} supplier
     * @return {Promise}
     * @memberof ManagementSuppliersIndexEditController
     */
    @action onViewDetails(supplier) {
        // check if supplier record has been edited and prompt for confirmation
        if (supplier.hasDirtyAttributes) {
            return this.confirmContinueWithUnsavedChanges(supplier);
        }

        return this.hostRouter.transitionTo('console.pallet.suppliers.index.details', supplier);
    }

    /**
     * Trigger a route refresh and focus the new supplier created.
     *
     * @param {SupplierModel} supplier
     * @return {Promise}
     * @memberof ManagementSuppliersIndexEditController
     */
    @action onAfterSave(supplier) {
        if (this.overlay) {
            this.overlay.close();
        }

        this.hostRouter.refresh();
        return this.hostRouter.transitionTo('console.pallet.suppliers.index.details', supplier);
    }

    /**
     * Prompts the user to confirm if they wish to continue with unsaved changes.
     *
     * @method
     * @param {SupplierModel} supplier - The supplier object with unsaved changes.
     * @param {Object} [options={}] - Additional options for configuring the modal.
     * @returns {Promise} A promise that resolves when the user confirms, and transitions to a new route.
     * @memberof ManagementSuppliersIndexEditController
     */
    confirmContinueWithUnsavedChanges(supplier, options = {}) {
        return this.modalsManager.confirm({
            title: 'Continue Without Saving?',
            body: 'Unsaved changes to this supplier will be lost. Click continue to proceed.',
            acceptButtonText: 'Continue without saving',
            confirm: () => {
                supplier.rollbackAttributes();
                return this.hostRouter.transitionTo('console.pallet.supplier.index.details', supplier);
            },
            ...options,
        });
    }
}
