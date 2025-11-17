import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PaymentPage = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setPaymentDetails(null);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/payments/create-order`,
        { amount: Number(amount), currency: "INR" },
        { withCredentials: true }
      );

      const orderData = data?.data;
      if (!orderData) {
        toast.error("Order creation failed", { description: "Could not create Razorpay order." });
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Payment Mock",
        description: "Test Transaction & Blockchain Log",
        order_id: orderData.id,
        handler: async (response) => {
          try {
            const verification = await axios.post(
              `${API_BASE_URL}/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: Number(amount),
                currency: "INR",
              },
              { withCredentials: true }
            );
            setPaymentDetails(verification.data.data);
            toast.success("Payment Verified", {
              description: "Your transaction has been recorded.",
            });
          } catch {
            toast.error("Verification Failed", {
              description: "Payment verification could not be completed.",
            });
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.fullname || "Test User",
          email: user?.email || "test.user@example.com",
          contact: user?.phoneNumber || "9999999999",
        },
        notes: { address: "Test Corporate Office" },
        theme: { color: "#3399cc" },
      };

      if (import.meta.env.DEV) {
        options.prefill.method = "upi";
        options.prefill.vpa = "success@razorpay";
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on("payment.failed", () => {
        toast.error("Payment Failed", { description: "The payment could not be processed." });
        setLoading(false);
      });
    } catch {
      toast.error("Payment Error", {
        description: "Something went wrong during the payment process.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-lg w-fit mb-4">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Donate & Log on Blockchain</CardTitle>
          <CardDescription>
            Make a test payment with Razorpay. The transaction will be logged on your local
            blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (INR)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handlePayment}
            disabled={loading || !amount || amount <= 0 || !user}
            className="w-full h-12 text-lg"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Pay ₹${amount}`}
          </Button>
          {!user && <p className="text-xs text-red-500">Please log in to make a payment.</p>}
          {paymentDetails && (
            <div className="text-sm text-cyan-600 dark:text-cyan-400 text-center p-3 bg-cyan-50 dark:bg-gray-800 rounded-lg">
              <p className="font-semibold">Payment Verified!</p>
              <p className="break-all">
                <strong>Tx Hash:</strong> {paymentDetails.blockchainTxHash}
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentPage;
