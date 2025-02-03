frappe.ui.form.on("RUA App Update", {
    refresh(frm) {
        const detailsField = frm.fields_dict.details;
        
        // Add version fetching for new documents
        if (frm.is_new()) {
            frappe.call({
                method: 'rua.rua.doctype.rua_app_update.rua_app_update.get_app_version',
                callback: function(r) {
                    if (r.message) {
                        frm.set_value('version', r.message);
                    }
                }
            });
        }
        
        const renderImages = () => {
            let content = detailsField.get_value();
            if (!content) return;
            
            // First, clean up the converted links
            content = content.replace(
                /<a href="([^"]+)"[^>]*>[^<]+<\/a>/g,
                '$1'
            );
            
            // Handle all variations of img tags
            content = content
                // Handle single quotes with self-closing
                .replace(
                    /&lt;img\s+src=\'([^']+)\'\/&gt;/g,
                    "<img src='$1' style='max-width: 100%;'>"
                )
                // Handle double quotes with self-closing
                .replace(
                    /&lt;img\s+src="([^"]+)"\/&gt;/g,
                    '<img src="$1" style="max-width: 100%;">'
                )
                // Handle single quotes without self-closing
                .replace(
                    /&lt;img\s+src=\'([^']+)\'&gt;/g,
                    "<img src='$1' style='max-width: 100%;'>"
                )
                // Handle double quotes without self-closing
                .replace(
                    /&lt;img\s+src="([^"]+)"&gt;/g,
                    '<img src="$1" style="max-width: 100%;">'
                );
            
            // Update the content with proper HTML
            const cleanContent = `<div class="ql-editor read-mode"><p>${content}</p></div>`;
            
            console.log("New content:", cleanContent); // For debugging
            detailsField.set_value(cleanContent);
        };

        // Add a custom button to trigger image rendering
        frm.add_custom_button(__('Render Images'), () => {
            renderImages();
        });
    }
});