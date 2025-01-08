# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

import frappe
import os
import csv
from frappe.model.document import Document
from frappe.utils.file_manager import save_file


class RUACompany(Document):
    pass

    @frappe.whitelist()
    def import_parties(self):
        # Get the path to the CSV file and read party names
        csv_path = os.path.join(os.path.dirname(frappe.get_app_path("rua")), "rua", "data", "Party.csv")
        parties_to_import = set()
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            parties_to_import = {row["Party Name"] for row in reader}
        
        # Delete only parties that are in our CSV
        existing_parties = frappe.get_all("RUA Party", filters={"party": ["in", list(parties_to_import)]})
        for party in existing_parties:
            frappe.delete_doc("RUA Party", party.name)

        # Read and process the CSV file
        images_dir = os.path.join(os.path.dirname(frappe.get_app_path("rua")), "rua", "data", "party-images")
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Create new party document
                doc = frappe.new_doc("RUA Party")
                doc.party = row["Party Name"]
                doc.type = row["Default Type"]
                doc.trn = row["TRN"] if row["TRN"] else ""
                doc.emirate = row["Emirate"]

                # Handle image if present
                image_file = row.get("Image", "")
                if image_file:
                    # Extract filename from the path
                    image_name = os.path.basename(image_file)
                    # Construct path to the image in party-images directory
                    image_path = os.path.join(images_dir, image_name)
                    if os.path.exists(image_path):
                        with open(image_path, 'rb') as img_file:
                            # Save file using frappe's file manager
                            file_doc = save_file(
                                fname=image_name,
                                content=img_file.read(),
                                dt="RUA Party",
                                dn=doc.party,
                                folder=None,
                                is_private=0,
                                df=None
                            )
                            doc.image = file_doc.file_url

                doc.insert()

        frappe.msgprint("Parties imported successfully!")
