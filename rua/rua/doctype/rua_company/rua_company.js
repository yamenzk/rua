// Copyright (c) 2025, Yamen Zakhour and contributors
// For license information, please see license.txt

frappe.ui.form.on("RUA Company", {
    refresh(frm) {
        frm.add_custom_button(__('Import Parties'), function() {
            frappe.confirm(
                'This will overwrite any existing parties. Are you sure you want to continue?',
                () => {
                    frm.call({
                        doc: frm.doc,
                        method: 'import_parties',
                        freeze: true,
                        freeze_message: __('Importing Parties...'),
                        callback: function(r) {
                            frappe.show_alert({
                                message: __('Parties imported successfully'),
                                indicator: 'green'
                            });
                        }
                    });
                }
            );
        });
    },
});
