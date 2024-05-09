export function Invoice(user) {
  return `
        <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice</title>
<style>
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #ddd;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
  }

  .header {
    text-align: center;
  }

  .logo {
    width: 100px;
    height: auto;
  }

  .invoice-details {
    margin-bottom: 20px;
  }

  .invoice-details td {
    padding: 5px;
  }

  .invoice-table th, .invoice-table td {
    border: none;
    padding: 8px;
  }

  .invoice-total {
    font-weight: bold;
  }

  .footer {
    text-align: center;
    font-size: 14px;
  }
</style>
</head>
<body>

<table class="header" cellpadding="0" cellspacing="0">
  <tr>
    <td colspan="2">
      <h2>Longford</h2>
      <p>${user.customer.first_name} ${user.customer.last_name}<br> ${user.customer.company} <br>${user.address.street}<br>${user.address.city}, ${user.address.state} ${user.address.zip}</p>
      <p>${user.customer.mobile_number} | ${user.customer.email}</p>
    </td>
    <td colspan="2" class="invoice-details">
      <table>
        <tr>
          <td>INVOICE</td>
          <td>#${user.invoice_number}</td>
        </tr>
        <tr>
          <td>DUE: Upon receipt</td>
          <td>Amount Due: $${user.total_amount}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<table class="invoice-table" cellpadding="0" cellspacing="0">
  <thead>
    <tr>
      <th>Services</th>
      <th>Qty</th>
      <th>Unit Price</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>${user.description}</td>
      <td>1.0</td>
      <td>$${user.total_amount}</td>
      <td>$${user.total_amount}</td>
    </tr>
    <!-- Add more rows as needed -->
  </tbody>
</table>

<table class="invoice-total" cellpadding="0" cellspacing="0">
  <tr>
    <td>Total: $${user.total_amount}</td>
  </tr>
</table>

<table class="footer" cellpadding="0" cellspacing="0">
  <tr>
    <td>Longford</td>
  </tr>
</table>

</body>
</html>


        `;
}