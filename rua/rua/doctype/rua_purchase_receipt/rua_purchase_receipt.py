# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import rua


class RUAPurchaseReceipt(Document):
    def publish_update(self):
        rua.refetch_resource("rua:purchase_receipt")

    def on_trash(self):
        self.publish_update()

    def after_insert(self):
        self.publish_update()


    def before_insert(self):
        if not self.purchase_order:
            frappe.throw("Please select a Purchase Order")
        
        lpo = frappe.get_doc("RUA LPO", self.purchase_order)
        self.party = lpo.party
        self.project = lpo.project
        self.supplier_lpo_ref = lpo.supplier_reference_number
        
        # Get all previous receipts for this purchase order
        previous_receipts = frappe.get_all(
            "RUA Purchase Receipt",
            filters={
                "purchase_order": self.purchase_order,
                "status": "Received",
                "name": ["!=", self.name]
            },
            fields=["name"]
        )

        
        
        # Create a dictionary to store previously received quantities per item
        received_quantities = {}
        for receipt in previous_receipts:
            receipt_doc = frappe.get_doc("RUA Purchase Receipt", receipt.name)
            for item in receipt_doc.items:
                if item.item in received_quantities:
                    received_quantities[item.item] += item.received_quantity
                else:
                    received_quantities[item.item] = item.received_quantity

        # Populate items with calculated quantities
        for item in lpo.items:
            previously_received = received_quantities.get(item.item, 0)
            pending_quantity = item.qty - previously_received
            
            # Only add items that still have pending quantities
            if pending_quantity > 0:
                new_item = {
                    "item": item.item,
                    "ordered_quantity": item.qty,
                    "previously_received_quantity": previously_received,
                    "received_quantity": 0,  # Initialize as 0
                    "remaining_quantity": pending_quantity  # Initialize as pending quantity
                }
                self.append("items", new_item)

    def validate(self):
        # Ensure we're not receiving more than what's pending
        for item in self.items:
            pending_quantity = (
                item.ordered_quantity - 
                item.previously_received_quantity
            )
            
            if item.received_quantity > pending_quantity:
                frappe.throw(
                    f"Cannot receive more than pending quantity for item {item.item}. "
                    f"Pending: {pending_quantity}, Attempted to receive: {item.received_quantity}"
                )
            
            # Calculate remaining quantity
            item.remaining_quantity = (
                item.ordered_quantity - 
                item.previously_received_quantity - 
                item.received_quantity
            )

    def on_update(self):
        self.publish_update()

        if (self.has_value_changed('status') and 
            self.status == 'Cancelled' and 
            self.get_doc_before_save().status == "Received"):
            self.recalculate_other_receipts()
            self.update_purchase_order_quantities(cancelled=True)

        elif (self.has_value_changed('status') and 
              self.status == 'Received' and 
              self.get_doc_before_save().status == "Draft"):
            self.update_purchase_order_quantities()
    
    def update_purchase_order_quantities(self, cancelled=False):
        """Update received quantities in the purchase order"""
        lpo = frappe.get_doc("RUA LPO", self.purchase_order)
        
        # Get all non-cancelled received receipts for this purchase order
        all_receipts = frappe.get_all(
            "RUA Purchase Receipt",
            filters={
                "purchase_order": self.purchase_order,
                "status": "Received"
            },
            fields=["name"]
        )
        
        # Initialize a dictionary to track total received quantities
        total_received_quantities = {}
        
        # Calculate total received quantities across all receipts
        for receipt in all_receipts:
            receipt_doc = frappe.get_doc("RUA Purchase Receipt", receipt.name)
            for item in receipt_doc.items:
                if item.item in total_received_quantities:
                    total_received_quantities[item.item] += item.received_quantity
                else:
                    total_received_quantities[item.item] = item.received_quantity
        
        # Update each item in the purchase order
        for lpo_item in lpo.items:
            # Get total received quantity for this item
            received_qty = total_received_quantities.get(lpo_item.item, 0)
            
            # Update received and pending quantities
            lpo_item.received_quantity = received_qty
            lpo_item.pending_quantity = lpo_item.qty - received_qty
        
        # Save the purchase order
        lpo.flags.ignore_validate_update_after_submit = True
        lpo.save()
        
    def recalculate_other_receipts(self):
        """Recalculate quantities in all other receipts when this receipt is cancelled"""
        other_receipts = frappe.get_all(
            "RUA Purchase Receipt",
            filters={
                "purchase_order": self.purchase_order,
                "status": "Received",
                "name": ["!=", self.name]
            },
            fields=["name"]
        )
        
        # For each receipt, recalculate previously_received_quantity
        for receipt in other_receipts:
            receipt_doc = frappe.get_doc("RUA Purchase Receipt", receipt.name)
            
            # Get all received receipts that came before this receipt
            previous_receipts = frappe.get_all(
                "RUA Purchase Receipt",
                filters={
                    "purchase_order": self.purchase_order,
                    "status": "Received",
                    "creation": ["<", receipt_doc.creation],
                    "name": ["!=", self.name]  # Exclude the cancelled receipt
                },
                fields=["name"]
            )
            
            # Calculate previously received quantities
            received_quantities = {}
            for prev_receipt in previous_receipts:
                prev_doc = frappe.get_doc("RUA Purchase Receipt", prev_receipt.name)
                for item in prev_doc.items:
                    if item.item in received_quantities:
                        received_quantities[item.item] += item.received_quantity
                    else:
                        received_quantities[item.item] = item.received_quantity
            
            # Update quantities in the current receipt
            for item in receipt_doc.items:
                item.previously_received_quantity = received_quantities.get(item.item, 0)
                item.remaining_quantity = (
                    item.ordered_quantity - 
                    item.previously_received_quantity - 
                    item.received_quantity
                )
            
            # Save the updated receipt
            receipt_doc.flags.ignore_validate = True  # Prevent infinite recursion
            receipt_doc.save()