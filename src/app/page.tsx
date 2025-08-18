import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/anomaly">Customer Anomaly</Link>
      <Link href="/customer-behavior">Customer behavior</Link>
    </div>
  );
};

export default page;
