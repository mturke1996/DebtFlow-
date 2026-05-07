$file = "c:\Users\mohtu\OneDrive\Desktop\debtflow-pro\src\pages\ClientProfilePage.tsx"
$lines = [System.IO.File]::ReadAllLines($file)

# The corrupted region is lines 2046-2077 (1-indexed), which is indices 2045-2076 (0-indexed)
# We need to replace those lines with the correct block

$replacement = @'
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={0.5}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    fontSize: "0.7rem",
                                    fontFamily: '"Outfit", "Cairo", sans-serif',
                                    fontVariantNumeric: "tabular-nums",
                                  }}
                                >
                                  {dayjs(expense.date).format("YYYY/MM/DD")}
                                </Typography>
                                {expense.notes && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    sx={{ fontSize: "0.7rem", opacity: 0.85, maxWidth: 160 }}
                                  >
                                    — {expense.notes}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>

                            <Stack alignItems="flex-end" spacing={0.5} sx={{ ml: 1, flexShrink: 0 }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={800}
                                color="error.main"
                                sx={{
                                  fontFamily: '"Outfit", "Cairo", sans-serif',
                                  fontSize: "0.98rem",
                                  fontVariantNumeric: "tabular-nums",
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {formatCurrency(expense.amount)}
                              </Typography>
                              <Stack direction="row" spacing={0.5}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditExpense(expense);
                                    setExpensesListDialogOpen(false);
                                  }}
                                  sx={{
                                    p: 0.5,
                                    color: "text.secondary",
                                    transition: "transform 160ms ease-out, color 160ms ease-out",
                                    "&:active": { transform: "scale(0.94)" },
                                    "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.1) },
                                  }}
                                >
                                  <Edit sx={{ fontSize: "1.1rem" }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setExpenseToDelete(expense.id);
                                    setDeleteExpenseDialogOpen(true);
                                  }}
                                  sx={{
                                    p: 0.5,
                                    color: "text.secondary",
                                    transition: "transform 160ms ease-out, color 160ms ease-out",
                                    "&:active": { transform: "scale(0.94)" },
                                    "&:hover": { color: "error.main", bgcolor: alpha(theme.palette.error.main, 0.1) },
                                  }}
                                >
                                  <Delete sx={{ fontSize: "1.1rem" }} />
                                </IconButton>
                              </Stack>
                            </Stack>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  <Box sx={{ mt: 3, pt: 3, borderTop: `1px dashed ${theme.palette.divider}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
                        إجمالي المصروفات + الأرباح
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={900}
                        color="error.main"
                        sx={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {formatCurrency(summary.totalExpenses + summary.profit)}
                      </Typography>
                    </Stack>
                  </Box>
'@

$replacementLines = $replacement -split "`n"

# Build new file: lines 0..2044 (first 2045 lines) + replacement + lines 2077..end
$before = $lines[0..2044]
$after = $lines[2076..($lines.Length - 1)]

$newLines = $before + $replacementLines + $after

[System.IO.File]::WriteAllLines($file, $newLines)

Write-Host "Done! Replaced lines 2046-2077 with corrected JSX ($($replacementLines.Length) new lines)."
Write-Host "Total lines: before=$($lines.Length), after=$($newLines.Length)"
