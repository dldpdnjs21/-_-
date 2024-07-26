package com.ureca.expensemanager.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

//@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "index.html"; //확장자 명시
    }
}