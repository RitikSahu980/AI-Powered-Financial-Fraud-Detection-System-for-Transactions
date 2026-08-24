package com.frauddetection.backend.controller;

import com.frauddetection.backend.dto.common.ApiResponse;
import com.frauddetection.backend.dto.request.CreateOrderRequest;
import com.frauddetection.backend.dto.request.CreateTransactionRequest;
import com.frauddetection.backend.dto.request.PaymentRequest;
import com.frauddetection.backend.dto.request.VerifyPaymentRequest;
import com.frauddetection.backend.dto.response.PaymentResponse;
import com.frauddetection.backend.dto.response.PredictionResponse;
import com.frauddetection.backend.dto.response.RazorpayOrderResponse;
import com.frauddetection.backend.dto.response.VerifyPaymentResponse;
import com.frauddetection.backend.entity.User;
import com.frauddetection.backend.enums.RiskLevel;
import com.frauddetection.backend.enums.TransactionType;
import com.frauddetection.backend.exception.ResourceNotFoundException;
import com.frauddetection.backend.repository.UserRepository;
import com.frauddetection.backend.service.RazorpayService;
import com.frauddetection.backend.service.RazorpayVerificationService;
import com.frauddetection.backend.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

	private final TransactionService transactionService;
	private final UserRepository userRepository;
	private final RazorpayService razorpayService;
	private final RazorpayVerificationService razorpayVerificationService;

	public PaymentController(TransactionService transactionService, UserRepository userRepository,
			RazorpayService razorpayService, RazorpayVerificationService razorpayVerificationService) {
		this.transactionService = transactionService;
		this.userRepository = userRepository;
		this.razorpayService = razorpayService;
		this.razorpayVerificationService = razorpayVerificationService;
	}

	@PostMapping("/create-order")
	public ResponseEntity<ApiResponse<RazorpayOrderResponse>> createOrder(

			@Valid @RequestBody CreateOrderRequest request

	) throws Exception {

		RazorpayOrderResponse response = razorpayService.createOrder(request.amount());

		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@PostMapping("/verify")
	public ResponseEntity<ApiResponse<VerifyPaymentResponse>> verifyPayment(

			@Valid @RequestBody VerifyPaymentRequest request) {

		boolean verified = razorpayVerificationService.verify(

				request.razorpayOrderId(), request.razorpayPaymentId(), request.razorpaySignature());

		if (!verified) {

			throw new IllegalArgumentException("Invalid payment signature.");

		}

		PaymentResponse payment = makePayment(request.userId(), request.payment()).getBody().data();
		
		transactionService.updateRazorpayDetails(
		        payment.transactionId(),
		        request.razorpayOrderId(),
		        request.razorpayPaymentId()
		);

		PaymentResponse updatedPayment = PaymentResponse.builder().transactionId(payment.transactionId())
				.paymentStatus(payment.paymentStatus()).predictionLabel(payment.predictionLabel())
				.riskLevel(payment.riskLevel()).fraudProbability(payment.fraudProbability())
				.confidence(payment.confidence()).remainingBalance(payment.remainingBalance())
				.alertCreated(payment.alertCreated())

				// Razorpay IDs
				.razorpayOrderId(request.razorpayOrderId()).razorpayPaymentId(request.razorpayPaymentId())

				.build();

		VerifyPaymentResponse response = VerifyPaymentResponse.builder().verified(true).payment(updatedPayment).build();

		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@PostMapping("/{userId}")
	public ResponseEntity<ApiResponse<PaymentResponse>> makePayment(@PathVariable String userId,
			@Valid @RequestBody PaymentRequest request) {

		User user = userRepository.findById(userId).orElseThrow(() -> ResourceNotFoundException.of("User", userId));

		BigDecimal oldBalance = user.getWalletBalance();

		if (oldBalance.compareTo(request.amount()) < 0) {
		    throw new IllegalArgumentException("Insufficient wallet balance.");
		}

		BigDecimal newBalance = oldBalance.subtract(request.amount());

		CreateTransactionRequest transactionRequest =
		        CreateTransactionRequest.builder()
		                .step((int) (System.currentTimeMillis() / 3600000L))
		                .type(mapPaymentMethod(request.paymentMethod()))
		                .paymentMethod(request.paymentMethod())
		                .amount(request.amount())
		                .nameOrig(user.getUserId())
		                .oldbalanceOrg(oldBalance)
		                .newbalanceOrig(newBalance)
		                .nameDest(request.recipientAccount())
		                .oldbalanceDest(BigDecimal.ZERO)
		                .newbalanceDest(BigDecimal.ZERO)
		                .build();
		PredictionResponse prediction = transactionService.submitTransaction(transactionRequest, user.getUserId());

		/*
		 * Only deduct balance if payment is NOT high risk.
		 */

		String paymentStatus;

		if (prediction.riskLevel() == RiskLevel.HIGH) {

			paymentStatus = "BLOCKED";

		} else {

			user.setWalletBalance(newBalance);

			userRepository.save(user);

			if (prediction.riskLevel() == RiskLevel.MEDIUM)
				paymentStatus = "UNDER_REVIEW";
			else
				paymentStatus = "SUCCESS";
		}

		PaymentResponse response = PaymentResponse.builder().transactionId(prediction.transactionId())
				.paymentStatus(paymentStatus).predictionLabel(prediction.predictionLabel().name())
				.riskLevel(prediction.riskLevel()).fraudProbability(prediction.fraudProbability())
				.confidence(prediction.confidence()).remainingBalance(user.getWalletBalance())
				.alertCreated(prediction.alertCreated()).build();

		return ResponseEntity.ok(ApiResponse.success(response));
	}

	private TransactionType mapPaymentMethod(String method) {

		return switch (method.toUpperCase()) {

		case "UPI" -> TransactionType.PAYMENT;

		case "BANK_TRANSFER" -> TransactionType.TRANSFER;

		case "CARD" -> TransactionType.DEBIT;

		case "WALLET" -> TransactionType.CASH_OUT;

		default -> TransactionType.PAYMENT;
		};
	}
}