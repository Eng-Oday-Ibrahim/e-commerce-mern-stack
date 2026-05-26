// 

import { Suspense } from "react";
import StoreProductsPage from "./ProductsPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StoreProductsPage />
    </Suspense>
  );
}