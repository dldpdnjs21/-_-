package com.ureca.expensemanager.controller;

import com.ureca.expensemanager.model.Expense;
import com.ureca.expensemanager.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/entries")
public class ExpenseController {
    
    @Autowired
    private ExpenseService expenseService;
    
    @GetMapping
    public List<Expense> getAllEntries() {
        return expenseService.getAllExpenses();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Expense> getEntryById(@PathVariable Long id) {
        Optional<Expense> expense = expenseService.getExpenseById(id);
        return expense.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Expense> createEntry(@RequestBody Expense expense) {
        Expense savedExpense = expenseService.saveExpense(expense);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedExpense);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateEntry(@PathVariable Long id, @RequestBody Expense expense) {
        if (expenseService.getExpenseById(id).isPresent()) {
            expense.setId(id);
            Expense updatedExpense = expenseService.saveExpense(expense);
            return ResponseEntity.ok(updatedExpense);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        if (expenseService.getExpenseById(id).isPresent()) {
            expenseService.deleteExpense(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}