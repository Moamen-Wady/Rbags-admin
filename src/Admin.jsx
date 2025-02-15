import { useState, useEffect, memo } from "react";
import api, { isCancel } from "./api";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Checkbox,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Box,
  IconButton,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";

export default memo(function Admin({ notify }) {
  const [user, setUser] = useState(null);

  const [isDisabled, setIsDisabled] = useState(false);
  const disableButtons = (state) => {
    setIsDisabled(state);
  };

  const LoginBox = memo(({ notify }) => {
    const [password, setPassword] = useState("");

    const handleLogin = () => {
      disableButtons(true);
      api
        .post("/login", { pw: password })
        .then((data) => {
          if (data.data.status == "ok") {
            sessionStorage.setItem("user", data.data.user);
            setUser(data.data.user);
            notify("success", "تم تسجيل الدخول بنجاح");
          } else {
            notify("error", "Wrong Password");
          }
        })
        .catch((err) => {
          notify("error", "Network Error");
        })
        .finally(() => {
          disableButtons(false);
        });
    };

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            padding: 4,
            border: "1px solid #ccc",
            borderRadius: 2,
            boxShadow: 3,
            textAlign: "center",
            backgroundColor: "white",
          }}
          className="loginBox"
        >
          <Typography variant="h6" gutterBottom>
            Login
          </Typography>
          <TextField
            type="password"
            label="Password"
            variant="outlined"
            fullWidth
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
          >
            Login
          </Button>
        </Box>
      </Box>
    );
  });

  const TableEdit = memo(({ notify }) => {
    const [selected, setSelected] = useState([]);
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState([]);
    const [updatedFormData, setUpdatedFormData] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [rows, setRows] = useState([]);

    useEffect(() => {
      const controller = new AbortController();
      api
        .get("/items", { signal: controller.signal })
        .then((result) => {
          setRows(result.data.items);
        })
        .catch((err) => {
          if (!isCancel(err)) {
            notify("error", "حدث خطأ! برجاء المحاولة مرة أخرى");
          }
        });
      return () => controller.abort();
    }, []);
    const handleSelect = (id) => {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    };
    const handleOpen = (editMode) => {
      setIsEditing(editMode);
      const data = editMode
        ? rows.filter((row) => selected.includes(row._id))
        : [{ name: "", unit: "", total: "", available: "" }];

      setFormData(data);
      setUpdatedFormData(data);
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };
    const handleDeleteOpen = () => {
      setDeleteDialogOpen(true);
    };
    const handleDeleteClose = () => {
      setDeleteDialogOpen(false);
    };
    const disableButtons = (state) => {
      setIsDisabled(state);
    };
    const handleSave = async () => {
      try {
        disableButtons(true);
        notify("info", "برجاء الانتظار");
        if (isEditing) {
          await api.put("/items", updatedFormData).then((data) => {
            setRows(data.data.items);
            notify("success", "تم تعديل العناصر");
          });
        } else {
          await api.post("/items", updatedFormData).then((data) => {
            setRows(data.data.items);
            notify("success", "تم اضافة العناصر");
          });
        }
      } catch (error) {
        if (!isCancel(error)) {
          notify("error", "حدث خطأ! برجاء المحاولة مرة أخرى");
        }
      } finally {
        setOpen(false);
        disableButtons(false);
      }
    };
    const handleDelete = async () => {
      try {
        notify("info", "برجاء الانتظار");
        disableButtons(true);
        await api.delete("/items", { data: selected }).then((data) => {
          setRows(data.data.items);
          notify("success", "تم حذف العناصر");
        });
      } catch (error) {
        if (!isCancel(error)) {
          notify("error", "حدث خطأ! برجاء المحاولة مرة أخرى");
        }
      } finally {
        setDeleteDialogOpen(false);
        disableButtons(false);
      }
    };
    const handleAddForm = () => {
      setFormData([
        ...formData,
        { name: "", unit: "", total: "", available: "" },
      ]);
    };
    const handleRemoveForm = (index) => {
      setFormData(formData.filter((_, i) => i !== index));
    };

    return (
      <>
        <Typography
          component="h1"
          variant="h2"
          sx={{
            textAlign: "center",
            my: 4,
            mx: "auto",
            fontFamily: "'El Messiri', sans-serif",
          }}
        >
          شنط رمضان
        </Typography>
        <TableContainer
          component={Paper}
          dir="rtl"
          className="table"
          elevation={1}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>الصنف</TableCell>
                <TableCell>الوحدة</TableCell>
                <TableCell>المطلوب</TableCell>
                <TableCell>المتاح</TableCell>
                <TableCell>المتبقي</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="checker">
                    <Checkbox
                      checked={selected.includes(row._id)}
                      onChange={() => handleSelect(row._id)}
                    />
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>{row.available}</TableCell>
                  <TableCell>
                    {Number(row.total) - Number(row.available)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box className="butCont">
          <Button
            className="butContButton"
            disabled={isDisabled}
            variant="contained"
            color="error"
            onClick={handleDeleteOpen}
          >
            حذف
          </Button>
          <Button
            className="butContButton"
            disabled={isDisabled}
            variant="contained"
            color="primary"
            onClick={() => handleOpen(true)}
          >
            تعديل
          </Button>
          <Button
            className="butContButton"
            disabled={isDisabled}
            variant="contained"
            color="success"
            onClick={() => handleOpen(false)}
          >
            إضافة عنصر
          </Button>
        </Box>
        <Dialog open={open} onClose={handleClose} dir="rtl">
          <DialogTitle>
            {isEditing ? "تعديل العناصر" : "إضافة عنصر جديد"}
          </DialogTitle>
          <DialogContent>
            {formData.map((item, index) => (
              <Box key={index} sx={{ mb: 2, position: "relative" }}>
                <TextField
                  label="الصنف"
                  defaultValue={updatedFormData[index]?.name || ""}
                  onChange={(e) => {
                    const newData = [...updatedFormData];
                    newData[index] = {
                      ...newData[index],
                      name: e.target.value,
                    };
                    setUpdatedFormData(newData);
                  }}
                  fullWidth
                  margin="dense"
                />
                <TextField
                  label="الوحدة"
                  defaultValue={updatedFormData[index]?.unit || ""}
                  onChange={(e) => {
                    const newData = [...updatedFormData];
                    newData[index] = {
                      ...newData[index],
                      unit: e.target.value,
                    };
                    setUpdatedFormData(newData);
                  }}
                  fullWidth
                  margin="dense"
                />
                <TextField
                  label="اجمالي المطلوب"
                  defaultValue={updatedFormData[index]?.total || ""}
                  onChange={(e) => {
                    const newData = [...updatedFormData];
                    newData[index] = {
                      ...newData[index],
                      total: e.target.value,
                    };
                    setUpdatedFormData(newData);
                  }}
                  fullWidth
                  margin="dense"
                />
                <TextField
                  label="المتاح"
                  defaultValue={updatedFormData[index]?.available || ""}
                  onChange={(e) => {
                    const newData = [...updatedFormData];
                    newData[index] = {
                      ...newData[index],
                      available: e.target.value,
                    };
                    setUpdatedFormData(newData);
                  }}
                  fullWidth
                  margin="dense"
                />
                {!isEditing && (
                  <IconButton
                    onClick={() => handleRemoveForm(index)}
                    sx={{ position: "absolute", top: 0, left: 0 }}
                  >
                    <Close />
                  </IconButton>
                )}
                {isEditing && index < formData.length - 1 && (
                  <Divider sx={{ my: 2 }} />
                )}
              </Box>
            ))}
          </DialogContent>
          {!isEditing && (
            <Button
              disabled={isDisabled}
              onClick={handleAddForm}
              startIcon={<Add />}
              sx={{ mx: 2 }}
            >
              إضافة عنصر آخر
            </Button>
          )}
          <DialogActions>
            <Button
              disabled={isDisabled}
              variant="contained"
              color="error"
              onClick={handleClose}
              sx={{ mt: 0, mr: 2, ml: 0, mb: 0 }}
            >
              إلغاء
            </Button>
            <Button
              disabled={isDisabled}
              variant="contained"
              color="success"
              sx={{ mt: 0, mr: 2, ml: 0, mb: 0 }}
              onClick={handleSave}
            >
              تم
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={deleteDialogOpen} onClose={handleDeleteClose} dir="rtl">
          <DialogTitle>هل أنت متأكد أنك تريد حذف العناصر المحددة؟</DialogTitle>
          <DialogActions>
            <Button
              disabled={isDisabled}
              variant="contained"
              color="error"
              onClick={handleDeleteClose}
              sx={{ mx: 1 }}
            >
              إلغاء
            </Button>
            <Button
              disabled={isDisabled}
              variant="contained"
              color="success"
              onClick={handleDelete}
              sx={{ mx: 1 }}
            >
              نعم، احذف
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  });
  return <>{user ? <TableEdit notify={notify}/> : <LoginBox notify={notify}/>}</>;
});
