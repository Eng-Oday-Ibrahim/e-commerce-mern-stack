import { Toast } from "@/lib/toast";

<Button
  onClick={() => {
    addToCart();
    Toast.addToCart();
  }}
>
  Add To Cart
</Button>
--------------------
Toast.addToFavorites();
Toast.removeFromFavorites();
-----------------------
Toast.productAdded();
Toast.productDeleted();
Toast.saved();
Toast.error("Failed to save product");
---------------------
toast.promise(saveProduct(), {
  loading: "Saving product...",
  success: "Product saved successfully",
  error: "Failed to save product",
});
----------------

