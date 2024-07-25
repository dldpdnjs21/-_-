package com.ureca.expensemanager.repository;

import com.ureca.expensemanager.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
}