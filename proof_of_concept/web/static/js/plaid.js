document.addEventListener('DOMContentLoaded', function() {
    fetch('/create_link_token', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (!data.link_token) {
                console.error("Failed to get link token:", data);
                return;
            }

            var linkHandler = Plaid.create({
                token: data.link_token,
                onSuccess: function(public_token, metadata) {
                    fetch('/get_access_token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ public_token: public_token })
                    }).then(response => response.json())
                      .then(data => {
                          window.location.href = '/transactions?access_token=' + data.access_token;
                      });
                },
                onExit: function(err, metadata) {
                    if (err) console.error("Plaid Link exited with error:", err);
                }
            });

            document.getElementById('link-button').onclick = function() {
                linkHandler.open();
                
            };
        })
        .catch(error => console.error("Error fetching link token:", error));
});
