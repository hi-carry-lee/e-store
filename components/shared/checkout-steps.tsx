import { cn } from "@/lib/utils";
import React from "react";

const CheckoutSteps = ({ current }: { current: number }) => {
  return (
    <div className="flex-between flex-col md:flex-row space-x-2 space-y-2 mb-10">
      {["User Login", "Shipping Address", "Payment Method", "Place Order"].map(
        (step, index) => (
          <React.Fragment key={step}>
            <div
              className={cn(
                "p-2 w-56 rounded-full text-center text-sm",
                index === current ? "bg-gray-200" : ""
              )}
            >
              {step}
            </div>
            {
              // * For each value in the array, render a horizontal line next to it; for the last value, do not render the horizontal line
              step !== "Place Order" && (
                <hr className="w-16 border-t border-gray-300 mx-2" />
              )
            }
          </React.Fragment>
        )
      )}
    </div>
  );
};

export default CheckoutSteps;
