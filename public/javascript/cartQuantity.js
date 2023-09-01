document.addEventListener('DOMContentLoaded', () => {

  const productContainer = document.querySelectorAll(".productContainer")
  const subTotalElement = document.getElementById('sub-total');
  const grandTotalElement = document.getElementById('grand-total')
  const checkoutBtn = document.getElementById('checkoutBtn');
  const outOfStockModal = document.getElementById("outOfStockModal");
  const closeModal = document.querySelector(".close");
  const productStock = document.querySelector('.productStock');


  const stock = parseInt(productStock.value);

  subTotalElement.textContent = '$0.00';
  grandTotalElement.textContent = '$0.00';

  updateSubTotalAndGrandTotal();

  productContainer.forEach((container) => {
    const quantityInput = container.querySelector('.productQuantity')
    const productId = container.querySelector('.productId').value
    const increment = container.querySelector('.incrementBtn')
    const decrement = container.querySelector('.decrementBtn')







    increment.addEventListener('click', () => {

      const newQuantity = parseInt(quantityInput.value) + 1
      updateQuantity(productId, parseInt(quantityInput.value) + 1)
        .then(() => {
          updateSubTotalAndGrandTotal();
        })
        .catch(error => {
          console.error(error);
        });
    });


    decrement.addEventListener('click', () => {
      const newQuantity = parseInt(quantityInput.value) - 1;
      if (newQuantity >= 1) {
        updateQuantity(productId, newQuantity)
          .then(() => {
            updateSubTotalAndGrandTotal();
          })
          .catch(error => {
            console.error(error);

          });
      }
    });




  })

  function updateSubTotalAndGrandTotal() {
    let subTotal = 0;
    productContainer.forEach(container => {
      const totalElement = container.querySelector('.total_price span');
      subTotal += parseFloat(totalElement.textContent.substring(1));
    });

    subTotalElement.textContent = `$${subTotal.toFixed(2)}`;
    const shippingCharge = parseFloat(document.getElementById('shipping_charge').textContent);


    const coupenValElement = document.getElementById("coupenVal");
    const coupenDiscount = coupenValElement.value;
  


    



    const grandTotal = isNaN(coupenDiscount) ? subTotal + shippingCharge : subTotal + shippingCharge - coupenDiscount;

  

    grandTotalElement.textContent = `$${grandTotal.toFixed(2)}`;
  }




  function updateQuantity(productId, newQuantity) {
    const productContainer = document.querySelector(`.productId[value="${productId}"]`).closest('.productContainer');
    const quantityInput = productContainer.querySelector('.productQuantity');
    const decreaseButton = quantityInput.previousElementSibling;
    const increaseButton = quantityInput.nextElementSibling;
    const productStock = parseInt(productContainer.querySelector('.productStock').value);

    fetch(`/cart/updatequantity/${productId}/${newQuantity}`, {
      method: 'PUT',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const updatedQuantity = data.product.quantity;

        quantityInput.value = updatedQuantity;
        const priceElement = productContainer.querySelector('.price span');
        const productPrice = parseFloat(priceElement.textContent);
        const totalElement = productContainer.querySelector('.total_price span');
        const newTotalPrice = (updatedQuantity * productPrice).toFixed(2);
        totalElement.textContent = `$${newTotalPrice}`;

        updateSubTotalAndGrandTotal();

        if (data.product.productId.stock === 0) {
          outOfStockModal.style.display = "block";
          increaseButton.disabled = true;
        } else {
          outOfStockModal.style.display = "none";
          increaseButton.disabled = false;
        }
      })
      .catch(error => console.error(error));
  }












  checkoutBtn.addEventListener('click', async () => {
    try {
      let newGrandTotal = 0;
      productContainer.forEach(container => {
        const totalElement = container.querySelector('.total_price span');
        newGrandTotal += parseFloat(totalElement.textContent.substring(1));
      })


      subTotalElement.textContent = `$${newGrandTotal.toFixed(2)}`
      const shippingCharge = parseFloat(document.getElementById('shipping_charge').textContent);

      const coupenValElement = document.getElementById("coupenVal");
      const coupenDiscount = coupenValElement.value;

      const grandTotal = newGrandTotal + shippingCharge-coupenDiscount;

      grandTotalElement.textContent = `$${grandTotal.toFixed(2)}`;

      window.location.href = '/order/checkOut';

    } catch (error) {
      console.error(error);
    }
  });




})