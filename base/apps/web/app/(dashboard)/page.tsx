import { Suspense } from "react";

import { HomePage } from "./home";

const Page = () => (
  <Suspense>
    <HomePage />
  </Suspense>
);

export default Page;
