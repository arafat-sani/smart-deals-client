import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";

const BillDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await fetch(
          `https://smart-deals-serversite.vercel.app/bills/${id}`
        );
        const data = await res.json();
        setBill(data);
      } catch (error) {
        console.error("Error fetching bill:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [id]);

  // Helper function to check if bill belongs to current month
  const isCurrentMonthBill = (billDateString) => {
    if (!billDateString) return false;

    const billDate = new Date(billDateString);
    const currentDate = new Date();

    const billMonth = billDate.getMonth();
    const billYear = billDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return billMonth === currentMonth && billYear === currentYear;
  };

  // Enhanced helper function that returns status and message
  const getBillPaymentStatus = (billDateString) => {
    if (!billDateString) return { canPay: false, message: "Invalid bill date" };

    const billDate = new Date(billDateString);
    const currentDate = new Date();

    const billMonth = billDate.getMonth();
    const billYear = billDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    if (
      billYear < currentYear ||
      (billYear === currentYear && billMonth < currentMonth)
    ) {
      return {
        canPay: false,
        message: "This bill is from a previous month and cannot be paid now.",
      };
    }

    if (
      billYear > currentYear ||
      (billYear === currentYear && billMonth > currentMonth)
    ) {
      return {
        canPay: false,
        message: "This bill is for a future month and cannot be paid yet.",
      };
    }

    return {
      canPay: true,
      message: "This bill is for the current month and can be paid.",
    };
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getCategoryColor = (category) => {
    const colors = {
      Electricity: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Gas: "bg-red-100 text-red-800 border-red-200",
      Water: "bg-blue-100 text-blue-800 border-blue-200",
      Internet: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const handlePayNow = async () => {
    if (!bill || !user) {
      alert("Please log in to pay bills");
      return;
    }

    const paymentStatus = getBillPaymentStatus(bill.date);
    if (!paymentStatus.canPay) {
      alert(` ${paymentStatus.message}`);
      return;
    }

    const paidBill = {
      username: user.name,
      email: user.email,
      billTitle: bill.title,
      category: bill.category,
      amount: bill.amount,
      date: new Date().toISOString(),
      address: user.address || "",
      phone: user.phone || "",
      image: bill.image,
      description: bill.description,
      location: bill.location,
      originalBillId: id, // Store the original bill ID for reference
      billDueDate: bill.date, // Store the original bill's due date
    };

    try {
      const res = await fetch(
        "https://smart-deals-serversite.vercel.app/paid-bills",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paidBill),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to record payment");
      }

      alert(
        "✅ Payment successful! The bill has been added to your paid bills."
      );

      // Optional: Redirect to MyPayBills page after successful payment
      // window.location.href = '/my-pay-bills';
    } catch (error) {
      console.error("Payment error:", error);
      alert(` Payment failed: ${error.message}`);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading bill details...</p>
        </div>
      </div>
    );

  if (!bill)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bill not found
          </h2>
          <p className="text-gray-600 mb-4">
            The bill you're looking for doesn't exist.
          </p>
          <Link
            to="/bills"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Bills
          </Link>
        </div>
      </div>
    );

  const paymentStatus = getBillPaymentStatus(bill.date);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/bills"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Bills
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <img
            src={bill.image}
            alt={bill.title}
            className="w-full h-64 object-cover"
          />
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {bill.title}
                </h1>
                <p className="text-gray-600 text-lg">{bill.location}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${bill.amount}
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${getCategoryColor(
                    bill.category
                  )}`}
                >
                  {bill.category}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Due Date</h3>
                <p className="text-gray-600">{formatDate(bill.date)}</p>
                <p
                  className={`text-sm mt-1 ${
                    paymentStatus.canPay ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {paymentStatus.canPay
                    ? " Current month bill"
                    : " Not current month"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                <p className="text-gray-600">{bill.category}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {bill.description}
              </p>
            </div>

            <div className="flex gap-4">
              {/* Pay Now Button with Month Validation */}
              <button
                onClick={handlePayNow}
                disabled={!paymentStatus.canPay || !user}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                  paymentStatus.canPay && user
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {!user
                  ? "Please Login to Pay"
                  : paymentStatus.canPay
                  ? "Pay Now"
                  : "Payment Not Available"}
              </button>

              <button className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200 shadow-sm">
                Download Invoice
              </button>
            </div>

            {/* Payment Status Information */}
            {!paymentStatus.canPay && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div>
                    <span className="text-yellow-800 text-sm font-medium">
                      Payment Restriction
                    </span>
                    <p className="text-yellow-700 text-sm mt-1">
                      {paymentStatus.message}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-yellow-600">
                      <span>Bill due date: {formatDate(bill.date)}</span>
                      <span>
                        Current month:{" "}
                        {new Date().toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Login Reminder */}
            {!user && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <div>
                    <span className="text-blue-800 text-sm font-medium">
                      Authentication Required
                    </span>
                    <p className="text-blue-700 text-sm mt-1">
                      Please log in to pay bills and access payment features.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Current Month Indicator */}
            {paymentStatus.canPay && user && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-green-800 text-sm">
                    ✅ This bill is eligible for payment. Click "Pay Now" to
                    proceed.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Payment Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p>
                <strong>Payment Policy:</strong> Only current month bills can be
                paid online.
              </p>
              <p className="mt-2">
                <strong>Late Payments:</strong> Contact support for previous
                month bills.
              </p>
            </div>
            <div>
              <p>
                <strong>Current Month:</strong>{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="mt-2">
                <strong>Support:</strong> support@utilitybills.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetails;
